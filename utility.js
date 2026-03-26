export const trycatchwrapper = (fn) => async (...args) =>{
    try {
        return await fn(...args)
    }catch (error) {
        console.error(`Exception occur: ${error.message}`)
    }
}

export const normalize = (string)=>{
    return String(string || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")
}