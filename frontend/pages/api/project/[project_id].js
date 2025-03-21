import { connectToDb } from '../../../lib/db';

export default async function handler(req, res) {
  const db = await connectToDb();
  const { id } = req.query;

  try {
    switch(req.method) {
      case 'GET':
        if(id) {
          const [project] = await db.query(`
            SELECT p.*, c.cname 
            FROM projects p
            LEFT JOIN customers c ON p.cid = c.cid
            WHERE p.pid = ?
          `, [id]);
          return res.status(200).json(project[0]);
        }
        
        const [projects] = await db.query(`
          SELECT p.*, c.cname 
          FROM projects p
          LEFT JOIN customers c ON p.cid = c.cid
          ORDER BY p.start_date DESC
        `);
        return res.status(200).json(projects);

      case 'POST':
        const { pname, start_date, end_date, status, cid } = req.body;
        if(!pname || !start_date || !end_date || !cid) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const [result] = await db.query(
          `INSERT INTO projects (pname, start_date, end_date, status, cid)
           VALUES (?, ?, ?, ?, ?)`,
          [pname, start_date, end_date, status, cid]
        );

        const [newProject] = await db.query(`
          SELECT p.*, c.cname 
          FROM projects p
          LEFT JOIN customers c ON p.cid = c.cid
          WHERE pid = ?
        `, [result.insertId]);
        return res.status(201).json(newProject[0]);

      case 'PUT':
        const updates = [];
        const params = [];
        
        Object.entries(req.body).forEach(([key, value]) => {
          if(['pname', 'start_date', 'end_date', 'status', 'cid'].includes(key)) {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if(updates.length === 0) {
          return res.status(400).json({ error: 'No valid fields to update' });
        }

        params.push(id);
        await db.query(
          `UPDATE projects SET ${updates.join(', ')} WHERE pid = ?`,
          params
        );

        const [updatedProject] = await db.query(`
          SELECT p.*, c.cname 
          FROM projects p
          LEFT JOIN customers c ON p.cid = c.cid
          WHERE pid = ?
        `, [id]);
        return res.status(200).json(updatedProject[0]);

      case 'DELETE':
        await db.query('DELETE FROM projects WHERE pid = ?', [id]);
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}