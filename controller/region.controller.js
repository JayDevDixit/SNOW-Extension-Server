import { normalize, trycatchwrapper } from "../utility.js"
import XLSX from "xlsx"
import stringSimilarity from "string-similarity"

let workbook,sheet_data,customers_names
export const find_region = trycatchwrapper(async (req,res,next) => {
    const customer = normalize(req?.body?.customer)
    if(!customer) {
        return res.status(400).json({
            message: "Customer name is required",
            success: false
        })
    }
    const sheet_path = './data/Customer details continued.xlsx'
    if (!workbook) {
        workbook = XLSX.readFile(sheet_path)
    }
    const sheet_name = workbook.SheetNames[0]
    sheet_data = sheet_data ? sheet_data : XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name])
    let customer_data = sheet_data.find((data) => data.Name.toLowerCase() === customer)
    if(!customer_data){
        customer_data = await check_similarity(customer)
    }
    if(!customer_data){
        return res.status(400).json({
            message: "Customer not found",
            success: false
        })
    }


    return res.status(200).json({
        responseData: customer_data,
        success: true
    })
})

const check_similarity = trycatchwrapper(async (customer)=>{
    customers_names = customers_names ? customers_names : sheet_data.map(d => normalize(d.Name))
    customer = normalize(customer)
    const match = stringSimilarity.findBestMatch(customer,customers_names)
    const bestIndex = match.bestMatchIndex
    const bestScore = match.bestMatch.rating
    if(bestScore < 0.4) return null 

    return sheet_data[bestIndex]

})