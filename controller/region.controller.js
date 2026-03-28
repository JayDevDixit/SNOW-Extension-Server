import { normalize, trycatchwrapper } from "../utility.js"
import XLSX from "xlsx"
import stringSimilarity from "string-similarity"
import path from 'path'
import fs from 'fs'


const cache={}
export const find_region = trycatchwrapper(async (req,res,next) => {
    const customer = normalize(req?.body?.customer)
    if (isNull(customer)) return res.status(404).json({
        message: 'Customer name is required',
        success: false
    })

    const data_dir = process.env.DATA_DIR
    const log_dir = process.env.LOG_DIR
    if(isNull(data_dir) || isNull(log_dir))
        throw Error('Fail to load data or log dir from .env')
    const excel_1 = path.join(data_dir,'Customer details continued.xlsx')
    const excel_2 = path.join(data_dir,'Customer and Region_Do_not_refer.xlsx')
    if(!fs.existsSync(excel_1) || !fs.existsSync(excel_2)) throw Error('Excel file or path does not exist')
    const s1 = await find_in_excel(customer,excel_1,[0],'Name')
    const s2 = await find_in_excel(customer,excel_2,[1,2,3],'Customer')
    if(isNull(s1) && isNull(s2))
        return res.status(404).json({
            message: 'Customer not found',
            success: false
    })
    return res.status(200).json({
        s1,s2,
        success: true
    })

})

const check_similarity = trycatchwrapper(async (sheet,customer,column)=>{
    let sheet_data = sheet['sheet_data'],bestIndex=-1,bestScore=0,bestsheetindex=-1
    for(let i=0;i<sheet['sheet_names'].length;i++){
        let customers_names = sheet_data[i].map(d => normalize(d[column]))
        customer = normalize(customer)
        const match = stringSimilarity.findBestMatch(customer,customers_names)
        const Index = match.bestMatchIndex
        const Score = match.bestMatch.rating
        if(Score > bestScore){
            bestIndex = Index
            bestScore = Score
            bestsheetindex = i
        }
    }
    if(bestScore > 0.4 && bestsheetindex != -1 && bestIndex != -1) return sheet_data[bestsheetindex][bestIndex]
    return null

})

const search_sheet = trycatchwrapper(async (sheet,name,column)=>{
    let search_name
    let sheet_data = sheet['sheet_data']
    for(let i=0;i<sheet['sheet_names'].length;i++){
        search_name = sheet_data[i].find((data) => (normalize(data[column]) === name))
        if(search_name) break
    }
    if(search_name) return search_name
    return await check_similarity(sheet,name,column)
})

const intializeXLSX = trycatchwrapper(async (filepath,sheet_indexes)=>{
    const filename = path.basename(filepath)
    if(filename in cache)
        return
    const excel = {}
    excel.sheet_path = filepath
    excel.workbook = XLSX.readFile(excel.sheet_path)
    excel.sheet_names = sheet_indexes.map(i=>excel.workbook.SheetNames[i])
    excel.sheet_data = excel.sheet_names.map(n=>XLSX.utils.sheet_to_json(excel.workbook.Sheets[n]))
    cache[filename] = excel

})

const isNull = (data) => {
    if(!data || data=='' || data==undefined || data==null){
        return true
    }
    return false
}



const find_in_excel = trycatchwrapper(async (customer,filepath,sheet_index,column)=>{
    // args in this function:
    // 1: string to search
    // 2: file where to search
    // 3: [] no of sheets in which to search
    // 4: column name of excel where to match search string
    await intializeXLSX(filepath,sheet_index)
    const sheet = cache[path.basename(filepath)]
    if (isNull(sheet)) return

    let customer_data = await search_sheet(sheet,customer,column)

    if(isNull(customer_data)) return

    return customer_data
})