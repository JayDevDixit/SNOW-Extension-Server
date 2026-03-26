import express from 'express'
import region_router from './routes/customer.route.js'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: '*'
}))

app.get('/',(req,res)=>{
    res.send('Hello from server')
})
app.use(express.json())
app.use('/api/v1/',region_router)

app.listen(5000, ()=>{
    console.log('Server is running on port 5000')
})