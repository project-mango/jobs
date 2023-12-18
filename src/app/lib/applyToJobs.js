//import puppeteer from 'puppeteer';
import jobApplications from '../data/jobApplications.js';
import applicantData from '../data/ApplicantData.js';
import bestPractices from '../data/bestPractices.js';
import getAnswerFromGPT from './getAnswerFromGPT.js';

// Import puppeteer-extra and the stealth plugin
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';



// Apply the stealth plugin
puppeteer.use(StealthPlugin());

async function findRequiredFields(page) {
    const requiredFieldContainers = await page.$$('.application-question.custom-question');

    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        const questionText = await container.$eval('.text', el => el.innerText.trim());

        // Handle input and textarea fields
        const inputFields = await container.$$('input, textarea');
        const inputAnswers = await Promise.all(inputFields.map(async field => {
            const name = await field.evaluate(el => el.name);
            const value = await field.evaluate(el => el.value);
            const type = await field.evaluate(el => el.type || 'textarea');
            return { name, value, type };
        }));

        // Handle select (dropdown) fields
        const selectFields = await container.$$('select');
        const selectAnswers = await Promise.all(selectFields.map(async field => {
            const name = await field.evaluate(el => el.name);
            const options = await field.$$eval('option', options => options.map(option => option.innerText.trim()));
            // Exclude the 'Select...' placeholder option if present
            const filteredOptions = options.filter(option => option.toLowerCase() !== 'select...');
            return { name, value: filteredOptions, type: 'select' };
        }));

        // Combine input and select field answers
        const answers = [...inputAnswers, ...selectAnswers];

        return { question: questionText, answers };
    }));
    //console.log(fieldDetails)
    return fieldDetails;
}

async function findRequiredFieldsInFirstForm(page) {
    await page.waitForSelector('form');
    const form = await page.$('form');

    if (!form) {
        console.log('No form found on the page.');
        return [];
    }

    const requiredFields = await form.$$('[required]');
    const fieldDetails = [];
    const processedFieldNames = new Set(); // A set to keep track of processed field names

    for (const field of requiredFields) {
    
        const name = await field.evaluate(el => el.name);
        const type = await field.evaluate(el => el.type);

        if (type === 'file' || name === 'resume' || processedFieldNames.has(name)) {
            continue; // Skip this field if already processed
        }

        processedFieldNames.add(name); // Add field name to the set

        let labelText = await field.evaluate(el => {
            if (el.labels.length > 0 && el.labels[0]) {
                return el.labels[0].innerText.trim();
            }
            return '';
        });

        let answers = [];

        if (type === 'select') {
            // Capture all options for select dropdown fields
            answers = await field.$$eval('option', options => 
                options.map(option => ({
                    value: option.value,
                    text: option.innerText.trim(),
                    type: 'select'
                })).filter(option => option.text.toLowerCase() !== 'select...')
            );
        } else if (type === 'radio' || type === 'checkbox') {
            // Find all radio buttons or checkboxes with the same name
            const sameNameFields = await form.$$(`input[name="${name}"][type="${type}"]`);
            for (const sameNameField of sameNameFields) {
                const value = await sameNameField.evaluate(el => el.value);
                answers.push({ value, type });
            }
        }

        // Update here to include type in each element
        fieldDetails.push({ name, labelText, type: type, answers: answers.length > 0 ? answers : undefined });
    }

    return fieldDetails;
}




/*async function findRequiredFieldsInFirstForm(page) {
    await page.waitForSelector('form');
    const form = await page.$('form');

    if (!form) {
        console.log('No form found on the page.');
        return [];
    }

    const requiredFields = await form.$$('[required]');
    const fieldDetails = [];

    for (const field of requiredFields) {
        const name = await field.evaluate(el => el.name);
        const type = await field.evaluate(el => el.type);

        if (type === 'file' || name === 'resume') {
            continue; // Skip resume upload field
        }

        const label = await page.evaluateHandle(el => el.labels.length > 0 ? el.labels[0] : null, field);
        let labelText = label ? await label.evaluate(el => el.innerText.trim()) : '';
        await label?.dispose();

        let answers = [];

        if (type === 'select') {
            // Capture all options for select dropdown fields
            answers = await field.$$eval('option', options => 
                options.map(option => ({
                    value: option.value,
                    text: option.innerText.trim(),
                    type: 'select'
                })).filter(option => option.text.toLowerCase() !== 'select...')
            );
        } else if (type === 'radio' || type === 'checkbox') {
            // Find all radio buttons or checkboxes with the same name
            const sameNameFields = await form.$$(`input[name="${name}"]`);
            for (const sameNameField of sameNameFields) {
                const value = await sameNameField.evaluate(el => el.value);
                answers.push({ value, type });
            }
        } else {
            answers.push({ value: '', type });
        }

        fieldDetails.push({ name, labelText, answers });
    }

    return fieldDetails;
}*/
// Function to select an option from a dropdown
async function selectDropdownOption(page, selectName, optionValue) {
    await page.evaluate((selectName, optionValue) => {
        const selectElement = document.querySelector(`select[name="${selectName}"]`);
        const options = Array.from(selectElement.options);
        const targetOption = options.find(option => option.text === optionValue);
        if (targetOption) {
            selectElement.value = targetOption.value;
            selectElement.dispatchEvent(new Event('change')); // Trigger change event
        }
    }, selectName, optionValue);
}

async function processQuestions(requiredFields, applicantData, page) {
    for (const field of requiredFields) {
        const context = JSON.stringify(applicantData); // Convert applicant data to a string
        const bestPracticeText = JSON.stringify(bestPractices);
        const answerOptions = field.answers.map(a => a.value).join(", "); // Create a string of answer options

        // Construct a prompt that includes the answer options
        const prompt = `Given the context: ${context}, and the answer options: ${answerOptions}, what is the best answer for the question: ${field.question}? Use these best practices ${bestPracticeText}`;

        const answer = await getAnswerFromGPT(prompt);
        console.log("Answer:", answer);

       // Check if the field is a textarea or an input
       if (field.answers.length === 0 || field.answers[0].type === "textarea" || field.answers[0].type === "text") {
        // Handle both textarea and text input fields
        const fieldSelector = `textarea[name="${field.answers[0]?.name}"], input[name="${field.answers[0]?.name}"][type="text"]`;
        console.log("Attempting to type into field:", fieldSelector);
        await page.waitForSelector(fieldSelector, { visible: true });
        await page.type(fieldSelector, answer, { delay: 100 });
        } else if (field.answers[0].type === "select") {
            // Handle dropdown fields
            console.log("Selecting option in dropdown:", field.answers[0].name, "Option:", answer);
            await selectDropdownOption(page, field.answers[0].name, answer);
         } else {
            // Logic to interact with radio or checkbox fields based on the GPT answer
            for (const option of field.answers) {
                console.log('This is option.value:', option.value);
                if (option.value === answer) {
                    if (option.type === "radio" || option.type === "checkbox") {
                        // Click the radio button or checkbox
                        const selector = `input[name="${option.name}"][value="${option.value}"]`;
                        console.log("Attempting to click on selector:", selector);
                        await page.waitForSelector(selector, { visible: true });
                        await page.click(selector);
                    }
                    // Add logic for other types of fields if necessary
                    break;
                }
            }
        }
    }
}
async function processQuestions2(requiredFields, applicantData, page) {
   
    for (const field of requiredFields) {
        
        console.log("current field:",field)
       // Check if the current field is the resume upload field
       
        const context = JSON.stringify(applicantData); // Convert applicant data to a string
        const bestPracticeText = JSON.stringify(bestPractices);
        //const answerOptions = field.answers.map(a => a.value).join(", "); // Create a string of answer options
        //console.log(answerOptions);
        const prompt = `Given the context: ${context}, and the answer options: ${field.answers}, what is the best answer for the question: ${field.labelText}? Use these best practices ${bestPracticeText}`;

        //const prompt = `Given the context: ${context}, what is the best answer for the question: ${field.labelText}?`;
        console.log(`Processing field with name: ${field.name}, type: ${field.type}`);
        // Print only the current question
        console.log("Current Question:", field.labelText);


        const answer = await getAnswerFromGPT(prompt);

        // Print the answer received from GPT
        console.log("GPT's Answer:", answer);

        // Selector for the field
        const fieldSelector = `[name="${field.name}"]`;

        // Handling different field types
        
        if (field.type === "textarea" || field.type === "text" || field.type === "email") {
            console.log("Attempting to type into field:", fieldSelector);
            await page.waitForSelector(fieldSelector, { visible: true });
            await page.type(fieldSelector, answer, { delay: 100 });
        } else if (field.type === "select") {
            console.log("Selecting option in dropdown:", field.name, "Option:", answer);
            await selectDropdownOption(page, field.name, answer);
        } else if (field.type === "radio" || field.type === "checkbox") {
            // Logic to interact with radio or checkbox fields based on the GPT answer
            for (const option of field.answers) {
                console.log('This is option.value:', option.value);
                if (option.value === answer) {
                    // Click the radio button or checkbox
                    const selector = `input[name="${field.name}"][value="${option.value}"]`;
                    console.log("Attempting to click on selector:", selector);
                    await page.waitForSelector(selector, { visible: true });
                    await page.click(selector);
                    break; // Break the loop after clicking the correct option
                }
            }
        }/*else if (field.type === "radio") {
            const radioOptionSelector = `${fieldSelector}[value="${answer}"]`;
            console.log("Attempting to click on radio option:", radioOptionSelector);
            await page.waitForSelector(radioOptionSelector, { visible: true });
            await page.click(radioOptionSelector);
            //await page.waitForTimeout(1000); 
        }*/
        // Add additional logic here for other types of inputs if necessary
    }
}


// a simple function for finding the "apply for this job" button
async function clickApplyButton(page){
    try{
        const applyButtonSelect = "a.postings-btn";
        const applyButton = await page.$(applyButtonSelect);
        if (!applyButton) {
            console.log("Apply button not found. Exiting function.");
            return; // exit incase not found so that this function doesn't hang
        }
        await page.waitForSelector(applyButtonSelect, {visible :true});

        await page.click(applyButtonSelect);

        console.log("Clicked on apply button to access job form");
    }catch(error){
        console.error("Error in function:clickApplyButton() clicking on the Apply button:", error);
    }
}
// Define a function to apply to jobs
async function applyToJobs(resumeFilePath) {
    // Launch the browser
    //console.log(1);
    const browser = await puppeteer.launch({ headless: false , executablePath:"C:/Program Files/Google/Chrome Dev/Application/chrome.exe" ,
         }); // 'headless: false' allows you to see the browser action
    //console.log(1);
    const page = await browser.newPage();
    //console.log(1);
      // Set a realistic user agent
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
      await page.setUserAgent(userAgent);
    //  console.log(1);

    for (let job of jobApplications) {
        try {
            // console.log(1)
            // Open the job application URL
            console.log("Navigating to URL:", job.url);
            await page.goto(job.url, { waitUntil: 'networkidle2' });

            //sometimes you can't access required field's unless you click "Apply for this job" which will take you to the actual form
            await clickApplyButton(page);

             // Get required fields
             const requiredFields = await findRequiredFieldsInFirstForm(page);
             //const requiredFields = await findRequiredFields(page);
             //if 
             //let output = await findRequiredFieldsInFirstForm(page);
             //console.log("findRequiredFieldsInFirstForm:",output)
             //output = await findRequiredFields(page);
             //console.log("findRequiredFields:",output)
             //return;
             console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

             //For each field - call gpt function -- pass through the answer options so that we can come 
            // back here and use that answer option to select the right answer
            await processQuestions2(requiredFields, applicantData, page);
            //await processQuestions(requiredFields, applicantData, page);

            console.log('starting 10 second wait')
            await page.waitForTimeout(10000);

             // Upload the resume
             
             const resumeInputSelector = 'input[type="file"][name="resume"]';
             await page.waitForSelector(resumeInputSelector);
             const resumeInput = await page.$(resumeInputSelector);
             console.log('uploading resume')
             await resumeInput.uploadFile(resumeFilePath);
             await page.waitForTimeout(10000); // waits for 10 seconds

             // Function to fill in the field if it is empty
            async function fillFieldIfEmpty(page, selector, value) {
                 const isEmpty = await page.$eval(selector, (el) => el.value === '');
                 if (isEmpty) {
                      await page.type(selector, value, { delay: 100 });
                    }
            }


        // Fill in the name field if empty
        /*const nameFieldSelector = 'input[name="name"]';
        await page.waitForSelector(nameFieldSelector, { visible: true });
        await fillFieldIfEmpty(page, nameFieldSelector, applicantData.name);

        // Fill in the email field if empty
        const emailFieldSelector = 'input[name="email"]';
        await page.waitForSelector(emailFieldSelector, { visible: true });
        await fillFieldIfEmpty(page, emailFieldSelector, applicantData.email);

        // Fill in the phone field if empty
        const phoneFieldSelector = 'input[name="phone"]';
        await page.waitForSelector(phoneFieldSelector, { visible: true });
        await fillFieldIfEmpty(page, phoneFieldSelector, applicantData.phone_number);

        // Fill in the portfolio url field if empty
        const portfolioFieldSelector = 'input[name="urls[Portfolio]"]';
        await page.waitForSelector(portfolioFieldSelector, { visible: true });
        await fillFieldIfEmpty(page, portfolioFieldSelector, applicantData.portfolio_link);*/

             await page.waitForTimeout(3000);
            console.log("submit button area reached. not submitting. just exiting.");
            return;
            // Additional code to find and click the submit button
             const submitButtonSelector = '#btn-submit';
             await page.waitForSelector(submitButtonSelector, { visible: true });
             await page.click(submitButtonSelector);

             // Wait for a while after clicking submit (optional, depends on the application's behavior)
              await page.waitForTimeout(30000); // waits for 30 seconds

        } catch (error) {
            console.error("An error occurred on URL:", job.url, error);
            await page.screenshot({ path: `error-${job.url.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
        }
        break;
    }

    await browser.close();
}

// Run the function
//applyToJobs();

export default applyToJobs;
