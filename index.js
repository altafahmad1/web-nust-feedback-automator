const express = require('express');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json({extended: false}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = process.env.PORT || 4000;

app.get('/', (req, res)=>{
  res.render("home");
});

app.post('/', async (req, res) => {
  let {username, password, option:opt, comments} = req.body;

  opt = parseInt(opt);

  try{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('https://qalam.nust.edu.pk/');
  
    await page.type('#login', username);
    await page.type('#password', password);
    await page.keyboard.press('Enter');
  
    await page.waitForNavigation();
    
    await page.goto('https://qalam.nust.edu.pk/student/qa/feedback');
  
    let forms = await page.evaluate(
      () => Array.from(
        document.querySelectorAll('.md-list-addon-element'),
        (a) => a.getAttribute('href')
      )
    );
  
    forms = forms.filter((href) => {
      if (href !== null && href.substr(0, 13) === '/survey/fill/') {
        return href;
      }
    });
  
    //Fill forms
    for (let i = 0; i < forms.length; i++) {
      console.log(`Form ${i + 1} of ${forms.length}`);
      await page.goto(`https://qalam.nust.edu.pk${forms[i]}`);
      let options = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('input'),
          (a) => a
        )
      );
  
      let textArea = await page.evaluate(
        () => document.querySelector('textarea')
      );
  
      if(options.length === 0){
        console.log('This form has already been filled or expired.');
      }
      else {
        for(let i=opt; i<options.length; i=i+5){
          options[i].click();
        }
        textArea.value = comments;
        console.log('Form Filled Successfully');
      }
  
      await page.screenshot({ path: `Form ${i+1}.png` });
    }
  
    await browser.close();
  } catch(err){
    console.log(err);
  }
  
});

app.listen(PORT, ()=>{
  console.log('Server started on port 4000.');
});


