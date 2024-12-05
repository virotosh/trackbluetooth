// server.js
import express from 'express';
import dotenv from 'dotenv';
import 'babel-polyfill';
import ReflectionWithJsObject from './src/usingJSObject/controllers/Reflection';
import ReflectionWithDB from './src/usingDB/controller/Reflection';
import UserWithDb from './src/usingDB/controller/Users';
import Auth from './src/usingDB/middleware/Auth';
import db from './src/usingDB/db';

dotenv.config();
const Reflection = process.env.TYPE === 'db' ? ReflectionWithDB : ReflectionWithJsObject;
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors')
const map = io.of('/map');
const { Client, Query } = require('pg');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).send({'message': 'YAY! Congratulations! Your first endpoint is working'});
});

app.post('/api/v1/reflections', Auth.verifyToken, Reflection.create);
app.get('/api/v1/reflections', Auth.verifyToken, Reflection.getAll);
app.get('/api/v1/reflections/:id', Auth.verifyToken, Reflection.getOne);
app.put('/api/v1/reflections/:id', Auth.verifyToken, Reflection.update);
app.delete('/api/v1/reflections/:id', Auth.verifyToken, Reflection.delete);
app.post('/api/v1/users', UserWithDb.create);
app.post('/api/v1/users/login', UserWithDb.login);
app.delete('/api/v1/users/me', Auth.verifyToken, UserWithDb.delete);
app.get('/verifyToken', Auth.verifyToken, UserWithDb.getOne);

map.on('connection', function(socket) {
  console.log('Client Connected');

  // Waiting user login
  socket.on('whoiam', function(user_id) {
    console.log(user_id);
    (async () => {
      const indoorQuery = `SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
          SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom,15)::json As geometry,
          (SELECT row_to_json(_) FROM (SELECT lg.level, lg.url) as _) As properties FROM
            (SELECT * FROM floorplans WHERE user_id='${user_id}' ORDER BY level DESC) As lg ) As f`
      const { rows } = await db.query(indoorQuery);
      socket.emit(`${user_id}_Login_Floorplan`, rows[0]);
    })().catch(err => console.log(err.stack));

    (async () => {
      const indoorQuery = `SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
          SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom,15)::json As geometry,
          (SELECT row_to_json(_) FROM (SELECT lg.device_holder, lg.room_label, lg.floorplan_url) as _) As properties FROM
            (SELECT DISTINCT ON (user_id,device_holder) * FROM indoor WHERE user_id='${user_id}' ORDER BY user_id,device_holder,created_date DESC) As lg ) As f`
      const { rows } = await db.query(indoorQuery);
      socket.emit(`${user_id}_Login_Marker`, rows[0]);
    })().catch(err => console.log(err.stack));

    (async () => {
      const activityQuery = `SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
  	                     SELECT public.features('${user_id}')) As f;`
      const { rows } = await db.query(activityQuery);
      let data = {'type':rows[0].type, 'features':[]};
      rows[0].features.forEach( (feature) => {
        data.features.push(feature.features);
      })
      map.emit(`${user_id}_Login_Activity`, data);
    })().catch(err => console.log(err.stack));

    //     (async () => {
    //       const activityQuery = `SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
    //             SELECT 'Feature' As type,
    //             (SELECT row_to_json(_) FROM (SELECT lg.device_holder, lg.room_label, lg.created_date) as _) As properties FROM
    //             (with data as
    //             (
    //                 select
    //                     ROW_NUMBER() OVER (ORDER BY created_date) AS number,
    //                     ROW_NUMBER() OVER (PARTITION BY device_holder, room_label  ORDER BY created_date) AS part,
    //                     *
    //                 from indoor where user_id='${user_id}' and device_holder='${holder}'
    //             )
    //             select MIN(created_date) as created_date, COUNT(*) count, device_holder, room_label
    //             from data group by device_holder, room_label, number - part
    //             order by created_date, number - part) As lg
    //           ) As f`
    //       var { rows } = await db.query(activityQuery);
    //       // console.log(rows[0])
    //       map.emit(`${user_id}_Login_Activity`, rows[0]);
    //     })().catch(err => console.log(err.stack));
  });

  socket.on('disconnect', function() {
      console.log('Client Disconnected');
  });
});


// LISTEN Postgres DB updates
(async () => {
  const client = new Client(process.env.DATABASE_URL);
  client.on('notification', function(msg) {
    //console.log(msg)
    let data = JSON.parse(msg.payload);
    let user_id = data.features[0].properties.user_id;
    map.emit(`${user_id}_DB`, data);
  });
  await client.connect();
  await client.query(`LISTEN watchers`);
})().catch(err => console.log(err.stack));


// Beacons
var Location = require('./lib/location/Location')
var EddystoneLocationProvider = require('./lib/location/provider/EddystoneLocationProvider')
const BeaconManager = require('./lib/ble/beacon/BeaconManager');
const IndoorPositionManager = require('./IndoorPositionManager');

const scanner = io.of('/scanner');

var bm = new BeaconManager();
var indoorManager = new IndoorPositionManager(bm);

scanner.on('connection', function(socket) {
  console.log('Scanner Connected');
  socket.on('message', function(msg) {
    // console.log(msg)
		var advertisingPacket = bm.processAdvertisingData(msg.id, msg, msg.rssi);
		if (advertisingPacket != null) {
      var beacon = bm.getBeacon(msg.id, advertisingPacket);
      // if(beacon.macAddress === 'c9eeac1cd377' && beacon.beaconType == 'eddystoneUid')
      //   console.log(beacon.station + ' : ' +beacon.getDistance() + ' : ' +msg.rssi + ': ' +msg.id + ': ' +beacon.beaconType + ': ' + beacon.getFilteredRssi());
      if (!beacon.hasLocation() && beacon.beaconType == 'eddystoneUid' && beacon.macAddress === 'c9eeac1cd377'){
        console.log(beacon.macAddress + ' : ' + beacon.station);
        (async () => {
          const indoorQuery = `select ST_AsGeoJSON(geom,15)::json from stations where name='${beacon.station}'`
          const { rows } = await db.query(indoorQuery);
          let lat = rows[0].st_asgeojson.coordinates[1];
          let lng = rows[0].st_asgeojson.coordinates[0];
          let loc = new Location(lat, lng);
          console.log(`${beacon.station} ${lat} ${lng}`)
          var provider = new EddystoneLocationProvider(beacon);
          provider.updateLocation(loc);
          beacon.setLocationProvider(provider);
        })().catch(err => console.log(err.stack));
        // if (beacon.station == 'rasberrypi001'){
        //   var _loc = new Location(60.248683110544505, 25.010953278621514);
        //   var _provider = new EddystoneLocationProvider(beacon)
        //   _provider.updateLocation(_loc);
        //   beacon.setLocationProvider(_provider)
        // }
        // if (beacon.station == 'device001'){
        //   var _loc = new Location(60.24878007945074, 25.010891904688833);
        //   var _provider = new EddystoneLocationProvider(beacon)
        //   _provider.updateLocation(_loc);
        //   beacon.setLocationProvider(_provider)
        // }
        // if (beacon.station == 'device002'){
        //   var _loc = new Location(60.24870691521227, 25.011099306254437);
        //   var _provider = new EddystoneLocationProvider(beacon)
        //   _provider.updateLocation(_loc);
        //   beacon.setLocationProvider(_provider)
        // }
      }
      indoorManager.updateLocation();
      var _data = [];
      var count = 0;
      for (var name in indoorManager.getIndoorPositionGroups()){
        var _loc = indoorManager.getIndoorPositionGroups()[name].getMeanLocation(100);
        if(_loc!=null){
          _data.push({'name': name,'lng':_loc.longitude, 'lat':_loc.latitude});
          count+=1;
        }
      }
      if(count>0){
        _data.forEach((item, i) => {
          (async () => {
            const createQuery = `INSERT INTO
              indoor(device_holder, user_id, room_label, floorplan_url, geom, created_date, modified_date)
              VALUES((SELECT holder FROM devices WHERE macaddress='${item.name}'),
                      '366b2b71-fea3-4135-9f27-1d47be85f692',
                      (SELECT label FROM rooms WHERE level='1' AND ST_Within(ST_Transform(ST_SetSRID(ST_MakePoint(${item.lng}, ${item.lat}), 4326), 4326), rooms.geom)),
                      (SELECT url FROM floorplans WHERE level='1' AND ST_Within(ST_Transform(ST_SetSRID(ST_MakePoint(${item.lng}, ${item.lat}), 4326), 4326), floorplans.geom)),
                      ST_SetSRID(ST_MakePoint(${item.lng}, ${item.lat}),4326),
                      CURRENT_TIMESTAMP,
                      CURRENT_TIMESTAMP)
              returning *`;
            const { rows } = await db.query(createQuery);
          })().catch(err => console.log(err.stack));
        });
      }
		}
  });

  socket.on('disconnect', function() {
    console.log('Scanner Disconnected');
  });
});

server.listen(4000)
console.log('app running on port ', 4000);
