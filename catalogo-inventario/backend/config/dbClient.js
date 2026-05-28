import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  user: 'postgres',
  password: 'Duvan_R18',
  database: 'marketplace',
  port: 5432,
  host: '/cloudsql/carritocompras-497105:us-central1:marketplace-postgres'
})

export default pool