import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from "ejs"
import path from "path"
import bodyParser from "body-parser";
import dotenv from "dotenv"; 
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs"; 
import Razorpay from "razorpay"
import mysql from 'mysql2'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();




// app.set('view engine', 'html');
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'html');
// app.set('public', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);

dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.get('/ourstory', (req, res) => {
    res.render('about');
  });
  app.get('/vision', (req, res) => {
    res.render('vision');
  });app.get('/activity', (req, res) => {
    res.render('activity');
  });app.get('/gallary', (req, res) => {
    res.render('gallary');
  });app.get('/awareness', (req, res) => {
    res.render('awareness');
  });app.get('/education', (req, res) => {
    res.render('education');
  });app.get('/emergency', (req, res) => {
    res.render('emergency');
  });app.get('/healthcare', (req, res) => {
    res.render('healthcare');
  });app.get('/youth', (req, res) => {
    res.render('youth');
  });



  app.get("/donate", (req, res) => {
    // res.sendFile(__dirname + "/index.html");
    res.render('donate');
    console.log("index.html sent");
});

app.post("/payNow", (req, res) => {
    const { amount, name } = req.body;
    console.log("donate button pressed");
    if (!amount) {
        return res.status(400).send("Amount is required.");
    }

    var options = {
        amount: amount * 100, // Amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            console.error("Error creating order:", err);
            res.status(500).send("Error creating order");
        } else if (order && order.id) {
            console.log("Order created successfully:", order.id);
            res.send({ orderId: order.id });
        } else {
            console.error("Unexpected response from Razorpay:", order);
            res.status(500).send("Unexpected response from Razorpay");
        }
    });
});

app.post("/api/payment/verify", (req, res) => {
    let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

    var expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    var response = { signatureIsValid: false };

    if (expectedSignature === req.body.razorpay_signature) {
        response = { signatureIsValid: true };
    }

    res.send(response);
});

app.get('/generatePDF', (req, res) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('thankyou.pdf')); // Save the PDF to a file

  // Set the font for the entire document
  doc.font('Helvetica');

  // Center the logo horizontally
  const logoX = 200;
  doc.image("./public/css/pdf_logo.jpg", logoX, 0, { width: 200 });
  doc.moveDown(3); // Some space

  // Add NGO name centered, in bold and large size
  doc.fontSize(26).font('Helvetica-Bold').text('Happy Day Foundation', { align: 'center' });
  doc.moveDown(1); // Some space

  // Add a small description of the NGO
  doc.fontSize(14).text('A non-profit organization dedicated to making the world a better place for underprivileged children.', { align: 'center' });
  doc.moveDown(2); // Some space

  // Donor details
  doc.fontSize(18).text('Donor Details:', { align: 'center' });
  doc.fontSize(14).text('Name: ' + req.query.userName);
  doc.text('Donation Amount: ' + req.query.donationAmount + ' INR');
  doc.moveDown(2); // Some space

  // Thank the donor for their precious donation
  doc.fontSize(18).text('Thank You for Your Generous Donation!', { align: 'center' });
  doc.moveDown(2); // Some space

  // Impact Statement
  doc.fontSize(18).text('Impact of Your Donation:', { align: 'center' });
  doc.fontSize(14).text('Your generous contribution plays a vital role in improving the lives of underprivileged children. At Happy Day Foundation, we are dedicated to enhancing the health and education of these young minds.', { align: 'center' });
  doc.moveDown(1); // Some space
  doc.fontSize(14).text('With your support, we can provide:', { align: 'left' });
  doc.fontSize(14).text(' - Access to quality healthcare to ensure their well-being.', { align: 'left' });
  doc.fontSize(14).text(' - Educational opportunities, including books, school supplies, and quality teaching.', { align: 'left' });
  doc.moveDown(2); // Some space

  // // Success Stories
  // doc.fontSize(18).text('Success Stories:', { align: 'center' });
  // doc.fontSize(14).text('We would like to share a heartwarming success story with you: [Include a success story or case study here]', { align: 'center' });
  // doc.moveDown(2); // Some space

  // // Future Plans
  // doc.fontSize(18).text('Our Future Plans:', { align: 'center' });
  // doc.fontSize(14).text('At Happy Day Foundation, our future plans are dedicated to providing a brighter future for underprivileged children. We aim to:', { align: 'center' });
  // doc.fontSize(14).text(' - Ensure access to nutritious and high-quality food, promoting their health and well-being.', { align: 'left' });
  // doc.fontSize(14).text(' - Enhance educational opportunities by providing books, school supplies, and quality teaching to support their learning and growth.', { align: 'left' });
  // doc.fontSize(14).text(' - Empower these young minds with skills and knowledge to help them stand on their own feet and build a better future for themselves.', { align: 'left' });
  // doc.fontSize(14).text('With your continued support, we can turn these plans into a reality, creating a brighter tomorrow for the children we serve.', { align: 'center' });
  // doc.moveDown(2); // Some space

  // // Additional Information
  // doc.fontSize(18).text('Additional Information:', { align: 'center' });
  // doc.fontSize(14).text('About Us:', { align: 'left' });
  // doc.fontSize(14).text('Happy Day Foundation is dedicated to improving the lives of underprivileged children by providing access to quality healthcare and education. We work tirelessly to empower these young minds, ensuring they have a brighter future and the opportunity to stand on their own feet.', { align: 'left' });
  // doc.moveDown(2); // Some space

  // Contact Information
  doc.fontSize(18).text('Contact Information:', { align: 'center' });
  doc.fontSize(14).text('For inquiries and support, please feel free to contact us at:', { align: 'left' });
  doc.fontSize(14).text('Email: contact@happydayfoundation.org', { align: 'left' });
  doc.fontSize(14).text('Phone: +1 (123) 456-7890', { align: 'left' });
  doc.fontSize(14).text('Address: 123 Sunshine Street, Cityville, Country', { align: 'left' });
  doc.moveDown(1); // Some space

  // Thank You
  doc.fontSize(20).font('Helvetica-Bold').text('Thank You for Your Support!', { align: 'center' });

  doc.end(); // Finalize the PDF

  res.download('thankyou.pdf'); // Offer the generated PDF for download
});

// import bodyparser from "body-parser";
// import mongoose from "mongoose";
// const app=express();
// mongoose.connect("mongodb://127.0.0.1:27017/todolist",{useNewUrlParser: true,useUnifiedTopology: true});
// const itemschema={name:String};
// const sample=mongoose.model("sample",itemschema)
// app.use(bodyparser.urlencoded({extended:true}));
let sahil;
app.get("/join",(req,res)=>{
  res.render('join')
})
app.post("/join",(req,res)=>{
  sahil=req.body.namef;
  
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mOhite@32',
  database: 'mydb'
})

connection.connect()
var a=req.body.namef;
var sql = `INSERT INTO vol (name) VALUES ("${sahil}")`;
connection.query(sql, function (err) {
    if (err){
      console.error('Error connecting to MySQL:', err.message);
      throw err;
    }
    else{
    console.log("1 record inserted");
    console.log(`the record with name ${sahil}`);
    }
  });

connection.end()
  res.redirect("join");
})



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


