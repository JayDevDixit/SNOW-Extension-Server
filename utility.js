import {fileURLToPath} from 'url'
import fs from 'fs/promises';
import path from 'path'

export const trycatchwrapper = (fn) => async (...args) =>{
    const res = args[1]
    try {
        return await fn(...args)
    }catch (error) {
        console.error(`Exception occur: ${error.message}`)
        writelog(`Error Occured: ${error.message}`)
        return res.status(500).json({
          message: error.message || 'Internal server error' ,
          success: false
        })
    }
}

export const normalize = (string)=>{
    return String(string || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")
}
const timeStamp = () => {
  const date = new Date()

  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '-')

  const timePart = date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `${datePart}, ${timePart}`
}

export const writelog = trycatchwrapper(async(errormsg)=>{
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const logdir = path.join(__dirname,'logs')
    await fs.mkdir(logdir,{recursive:true})
    const logfile = path.join(logdir,`${getTodayDate()}.log`)
    await fs.appendFile(logfile,`${timeStamp()}      ${errormsg}\n`,'utf-8')
})

const getTodayDate = () => {
  const today = new Date()

  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()

  return `${day}${month}${year}`
}

export const reqReceive = trycatchwrapper((req,res,next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    writelog(`Incoming Request ip:${ip} Method:${req.method}`)
    next()
})