import express from 'express'
import cors from 'cors' 
import path from 'path'
import apiRoutes from './src/routes'
import { port } from './src/configs/keys.configs'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, './src/public')))

app.get('/', async (req, res, next) => res.sendFile(path.join(__dirname, './src/views/index.html')))
app.use('/api', apiRoutes)


app.listen(port, () => console.log(`Server now listening on port ${port}`))