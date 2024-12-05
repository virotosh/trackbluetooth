// db.js
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Create Reflection Table
 */
const createReflectionTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      reflections(
        id UUID PRIMARY KEY,
        success TEXT NOT NULL,
        low_point TEXT NOT NULL,
        take_away TEXT NOT NULL,
        owner_id UUID NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create User Table
 */
const createUserTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      users(
        id UUID PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Device Table
 */
const createDeviceTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      devices(
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        macaddress VARCHAR(128) NOT NULL,
        holder VARCHAR(128) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Indoor Table
 */
const createIndoorTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      indoor(
        id SERIAL PRIMARY KEY,
        device_holder VARCHAR(128) NOT NULL,
        room_label VARCHAR(128) NOT NULL,
        floorplan_url VARCHAR(128) NOT NULL,
        user_id UUID NOT NULL,
        geom GEOMETRY(POINT,4326) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Room Table
 */
const createRoomTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      rooms(
        id UUID PRIMARY KEY,
        label VARCHAR(128) NOT NULL,
        level VARCHAR(128) NOT NULL,
        geom GEOMETRY(POLYGON,4326) NOT NULL,
        user_id UUID NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Create Floorplan Table
 */
const createFloorplanTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      floorplans(
        id UUID PRIMARY KEY,
        level VARCHAR(128) NOT NULL,
        url VARCHAR(128) NOT NULL,
        address VARCHAR(128),
        city VARCHAR(128),
        state VARCHAR(128),
        zip VARCHAR(128),
        geom GEOMETRY(POLYGON,4326) NOT NULL,
        user_id UUID NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Station Table
 */
const createStationTable = () => {
  const queryText =
    `CREATE TABLE IF NOT EXISTS
      stations(
        id UUID PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        geom GEOMETRY(POINT,4326) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Indoor Trigger Function
 */
const createIndoorTriggerFunction = () => {
  const queryText =
    `CREATE FUNCTION indoor_trigger() RETURNS trigger AS $$
      DECLARE
        payload TEXT;
      BEGIN
        payload := (SELECT row_to_json(fc) FROM (
          SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
            SELECT 'Feature' As type, ST_AsGeoJSON(NEW.geom,15)::json As geometry,
            (SELECT row_to_json(_) FROM
              (SELECT NEW.user_id, NEW.room_label, NEW.device_holder, NEW.floorplan_url, NEW.created_date) as _) As properties
          ) As f
        ) As fc);
        PERFORM pg_notify('watchers', payload );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Watched Indoor Trigger
 */
const createIndoorTrigger = () => {
  const queryText =
    `CREATE TRIGGER watched_indoor_trigger AFTER INSERT ON indoor
      FOR EACH ROW EXECUTE PROCEDURE indoor_trigger()`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Create Actitivy Function
 */
const createActivityFunction = () => {
  const queryText =
    `CREATE OR REPLACE FUNCTION public.features(userid text)
        RETURNS TABLE(type TEXT, properties JSON) AS
      $$
      DECLARE
         formal_table text;
      BEGIN
         FOR formal_table IN
         	EXECUTE '
            SELECT holder
            FROM   devices
            WHERE user_id='''|| userid ||''''
          USING userid
         LOOP
            RETURN QUERY EXECUTE
            'SELECT ''Feature'' As type,
      		  (SELECT row_to_json(_) FROM (SELECT lg.device_holder, lg.room_label, lg.created_date) as _) As properties FROM
      		  (with data as
      		  (
      			  select
      			      ROW_NUMBER() OVER (ORDER BY created_date) AS number,
      			      ROW_NUMBER() OVER (PARTITION BY device_holder, room_label  ORDER BY created_date) AS part,
      			      *
      			  from indoor where user_id='''|| userid ||''' and device_holder='''||formal_table||'''
      		  )
      		  select MIN(created_date) as created_date, COUNT(*) count, device_holder, room_label
      		  from data group by device_holder, room_label, number - part
      		  order by created_date, number - part) As lg';
         END LOOP;
      END
      $$  LANGUAGE plpgsql`;

  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

/**
 * Drop Reflection Table
 */
const dropReflectionTable = () => {
  const queryText = 'DROP TABLE IF EXISTS reflections';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop User Table
 */
const dropUserTable = () => {
  const queryText = 'DROP TABLE IF EXISTS users';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Device Table
 */
const dropDeviceTable = () => {
  const queryText = 'DROP TABLE IF EXISTS devices';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Indoor Table
 */
const dropIndoorTable = () => {
  const queryText = 'DROP TABLE IF EXISTS indoor';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Room Table
 */
const dropRoomTable = () => {
  const queryText = 'DROP TABLE IF EXISTS rooms';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Room Table
 */
const dropFloorplanTable = () => {
  const queryText = 'DROP TABLE IF EXISTS floorplans';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Station Table
 */
const dropStationTable = () => {
  const queryText = 'DROP TABLE IF EXISTS stations';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Indoor Trigger Function
 */
const dropIndoorTriggerFunction = () => {
  const queryText = 'DROP FUNCTION IF EXISTS indoor_trigger';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Indoor Trigger
 */
const dropIndoorTrigger = () => {
  const queryText = 'DROP TRIGGER IF EXISTS watched_indoor_trigger ON indoor';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Drop Activity Function
 */
const dropActivityFunction = () => {
  const queryText = 'DROP FUNCTION IF EXISTS public.features(text)';
  pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Create All Tables
 */
const createAllTables = () => {
  createUserTable();
  createReflectionTable();
  createFloorplanTable();
  createRoomTable();
  createDeviceTable();
  createStationTable();
  createIndoorTable();
  createIndoorTriggerFunction();
  createIndoorTrigger();
  createActivityFunction();
}
/**
 * Drop All Tables
 */
const dropAllTables = () => {
  dropIndoorTriggerFunction();
  dropIndoorTrigger();
  dropActivityFunction();
  dropIndoorTable();
  dropStationTable();
  dropDeviceTable();
  dropRoomTable();
  dropFloorplanTable();
  dropReflectionTable();
  dropUserTable();
}
/**
 * Create Some Data Device
 */
const createSomeDataDevice1 = () => {
  const values = [
    uuidv4(),
    '366b2b71-fea3-4135-9f27-1d47be85f692',
    'd09c347fb4b6-eddystoneUid',
    'Tùng',
    moment(new Date()),
    moment(new Date())
  ];
  const queryText = `INSERT INTO
      devices(id, user_id, macaddress, holder, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;

  pool.query(queryText, values)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
const createSomeDataDevice2 = () => {
  const values = [
    uuidv4(),
    '366b2b71-fea3-4135-9f27-1d47be85f692',
    'c9eeac1cd377-eddystoneUid',
    'Khả Như',
    moment(new Date()),
    moment(new Date())
  ];
  const queryText = `INSERT INTO
      devices(id, user_id, macaddress, holder, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;

  pool.query(queryText, values)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}
/**
 * Create Some Data Room
 */
const createSomeDataRoom = () => {
  const values = [
    uuidv4(),
    'b854a61a-efcd-4fd9-bea6-2aaa5eee5753',
    'Phòng Khách',
    '1',
    moment(new Date()),
    moment(new Date())
  ];
  const queryText = `INSERT INTO
    rooms(id, user_id, label, level, created_date, modified_date, geom)
    VALUES($1, $2, $3, $4, $5, $6, ST_MakePolygon(ST_MakeLine( ARRAY[ (ST_SetSRID(ST_MakePoint(25.010872521579586,60.2487823247106),4326)),  (ST_SetSRID(ST_MakePoint(25.010937565148083,60.24868150086087),4326)), (ST_SetSRID(ST_MakePoint(25.011120625895046,60.24871111582277),4326)), (ST_SetSRID(ST_MakePoint(25.0110622878492,60.248809277572036),4326)), (ST_SetSRID(ST_MakePoint(25.010872521579586,60.2487823247106),4326)) ] )) )
      returning *`;
  pool.query(queryText,values)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
}

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});


module.exports = {
  createReflectionTable,
  createUserTable,
  createDeviceTable,
  createRoomTable,
  createStationTable,
  createFloorplanTable,
  createIndoorTable,
  createIndoorTable,
  createIndoorTriggerFunction,
  createActivityFunction,
  createAllTables,
  dropActivityFunction,
  dropIndoorTriggerFunction,
  dropIndoorTrigger,
  dropIndoorTable,
  dropUserTable,
  dropDeviceTable,
  dropReflectionTable,
  dropFloorplanTable,
  dropRoomTable,
  dropStationTable,
  dropAllTables,
  createSomeDataDevice1,
  createSomeDataDevice2,
  createSomeDataRoom
};

require('make-runnable');
