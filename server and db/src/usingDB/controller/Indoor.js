import moment from 'moment';
import uuidv4 from 'uuid/v4';
import db from '../db';
import Helper from './Helper';

const Indoor = {
  /**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
  async getAllMarkers(req, res) {
    // const text = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ( \
    //     SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom,15)::json As geometry, \
    //     (SELECT row_to_json(_) FROM (SELECT lg.id, lg.label) as _) As properties FROM (SELECT DISTINCT ON (id) * FROM indoor ORDER  BY id, timestamp DESC) As lg \
    //   ) As f;"
    // const text = 'SELECT * FROM users WHERE id = $1';
    // try {
    //   const { rows } = await db.query(text, [req.user.id]);
    //   if (!rows[0]) {
    //     return res.status(404).send({'message': 'user not found'});
    //   }
    //   const token = Helper.generateToken(rows[0].id);
    //   // return res.status(200).send(rows[0]);
    //   res.status(200).send({ user: rows[0].email, token });
    // } catch(error) {
    //   return res.status(400).send(error)
    // }
  }
}

export default User;
