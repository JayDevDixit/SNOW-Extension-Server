import express from 'express'
import region_router from './routes/customer.route.js'
import cors from 'cors'
import { reqReceive } from './utility.js'
import {rateLimit} from 'express-rate-limit'

const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit:100,
    standardHeaders: true,
    legacyHeaders:false,
    ipv6Subnet:56,
})
app.use(limiter)
app.use(cors({
    origin: '*'
}))
app.use(reqReceive)
app.get('/',(req,res)=>{
    res.send('Hello from server')
})
app.use(express.json())
app.use('/api/v1/',region_router)

app.listen(5000, ()=>{
    console.log('Server is running on port 5000')
})