

const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

const dotenv = require('dotenv');

dotenv.config();

const PESAPAL_CONSUMER_KEY = 'NBwGP0lXC5ZquZtPeYrd4HQFmmNmp4Di'
const PESAPAL_CONSUMER_SECRET = '4clYISBI8tBWrnIqlNUGmM/Ku/4='


const prodUrl='https://pay.pesapal.com/v3/api'
const testUrl='https://cybqa.pesapal.com/pesapalv3/api'

let serverHost=process.env.SERVER_HOST;
let WebHost=process.env.WEB_HOST;

const apiUrl='https://secure.3gdirectpay.com/API/v6/'
const initPaymentFlow=(booking)=>{
    const {_id}=booking
    return new Promise(async(resolve,reject)=>{
        const creds=JSON.parse(await getAuthToken())
        const token=creds.token
        const ipnObj=await registerIPN(token,_id)
        const {ipn_id,url}=ipnObj
        // console.log(ipn_id,url)
        const res=await initBooking(booking,token,ipn_id)
        resolve(res)


    })
}

const createToken=()=>{
    return new Promise((resolve, reject) => {
        const CompanyToken='8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3'
        const Request='createToken'
    })
}
const getAuthToken=()=>{
    let sandboxUrl='https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken'
    let realUrl='https://pay.pesapal.com/v3/api/Auth/RequestToken'

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    const raw = JSON.stringify({
        "consumer_key": PESAPAL_CONSUMER_KEY,
        "consumer_secret": PESAPAL_CONSUMER_SECRET
    });

    const requestOptions = {method: "POST",headers: myHeaders,body: raw,redirect: "follow"};

    return new Promise((resolve, reject) => {
        fetch(realUrl, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            // console.log(result)
            resolve(result)
        })
        
    })
 
}
const registerIPN=async(token,bookingId)=>{
    let theTestUrl=`${testUrl}/URLSetup/RegisterIPN`
    let theProdUrl=`${prodUrl}/URLSetup/RegisterIPN`
    return new Promise(async(resolve,reject)=>{
        // const {customer,_id,trip}=booking
        const theData={
            "url": `${serverHost}/api/v1/bookings/status/${bookingId}`,
            "ipn_notification_type": "POST"
        }

        fetch(theProdUrl,{
            method:'POST',
            headers:{
                "Accept":"application/json",
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify(theData)
        })
        .then(async res=>{
            const resp=await res.json()
            resolve(resp)
        })
    })
}
const initBooking=async(booking,token,ipn_id)=>{
    let theTestUrl=`${testUrl}/Transactions/SubmitOrderRequest`
    let theProdUrl=`${prodUrl}/Transactions/SubmitOrderRequest`
    return new Promise(async(resolve,reject)=>{
        const {customer,_id,trip}=booking
        const theTrip=await Trip.findById(trip)
        const {price,title}=theTrip
        const currency='USD'

        const orderData={
            id:_id,currency:'USD',
            amount:0.5,
            description:title,
            callback_url:`${WebHost}/booking/confirm?id=${_id}`,
            cancellation_url:`${WebHost}/booking/cancel?id=${_id}`,
            notification_id:ipn_id,
            billing_address:{
                "email_address":customer.email,
                "phone_number":customer.phone,
                "first_name":customer.name.split(" ")[0],
                "last_name":customer.name.split(" ")[1],
                "country_code":customer.country_code,
                "city":customer.city,
                "state":customer.state,
                "postal_code":customer.postal_code,
                "zip_code":customer.zip_code,
                "line_1":customer.line_1,
                "line_2":customer.line_2,
                
            }
        }

        fetch(theProdUrl,{
            method:'POST',
            headers:{
                "Accept":"application/json",
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify(orderData)
        })
        .then(async resp=>{
            const res=await resp.json()
            resolve(res)
        })
    })
}


module.exports = { initBooking,registerIPN ,getAuthToken,startPaymentFlow};