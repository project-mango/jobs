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

async function findRequiredFields(page, selectors) {
    // wait for form to load
    await page.waitForSelector('form');
    const form = await page.$('form');
    // check if form exists incase of bug
    if (!form) {
        console.log('No form found on the page. ');
        return [];
    }
    
    let requiredFieldContainers = [];

    // Try each selector until we find required fields
    for (const selector of selectors) {
        requiredFieldContainers = await page.$$(selector);
        if (requiredFieldContainers.length > 0) {
            console.log(selector+" worked.")
            break;
        }else{
            console.log(selector+" did not work.")
        }
    }

    // If no fields found, return empty or a message
    if (requiredFieldContainers.length === 0) {
        return 'No required fields found';
    }
    // requiredFieldContainers = await page.$('#application-form');

    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        const textElement = await container.$('.text');
        let questionText = '';
        if (textElement) {
            questionText = await textElement.evaluate(el => el.innerText.trim());
        }

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
    
    return fieldDetails;
}

async function findRequiredFieldsWorkable(page, selectors) {
    // Wait for the form to load
    await page.waitForSelector('form');
    const form = await page.$('form');

    // Check if the form exists to handle potential errors
    if (!form) {
        console.log('No form found on the page.');
        return [];
    }

    let requiredFieldContainers = [];

    // Iterate through selectors to find required fields
    for (const selector of selectors) {
        requiredFieldContainers = await page.$$(selector);
        if (requiredFieldContainers.length > 0) {
            console.log(`${selector} worked.`);
            break;
        } else {
            console.log(`${selector} did not work.`);
        }
    }

    // Return a message if no required fields are found
    if (requiredFieldContainers.length === 0) {
        return 'No required fields found';
    }

    // Extract field details, skipping already filled fields
    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        const questionText = await container.$eval('label', label => label.innerText.trim());

        const fields = await container.$$('input, textarea, select');
        const fieldData = await Promise.all(fields.map(async field => {
            const name = await field.evaluate(el => el.name || el.id);
            const value = await field.evaluate(el => el.value);
            const type = await field.evaluate(el => el.type || el.nodeName.toLowerCase());

            // Skip fields that are already filled
            if (value === '') {
                return { name, type };
            }
            return null;
        }));

        // Filter out null values (fields that were skipped)
        const filteredFieldData = fieldData.filter(field => field !== null);

        return { question: questionText, answers: filteredFieldData };
    }));

    return fieldDetails.filter(detail => detail.answers.length > 0);
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

        if (type === 'file' || name === 'resume' ) {
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
        console.log(type)
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
    const requiredFieldContainers = await page.$$('.application-question.custom-question');

    const fieldDetails2 = await Promise.all(requiredFieldContainers.map(async container => {
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

    return [...fieldDetails, ...fieldDetails2];
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

async function processQuestions(requiredFields, applicantData, page, resumeFilePath) {
    //console.log("waiting 30 seconds to diagnose in processQuestions")
    
    for (const field of requiredFields) {
        if(field.answers[0].type === "file"){
            // Upload portfolio
            const portfolioInputSelector = `input[name="${field.answers[0].name}"]`;
            await page.waitForSelector(portfolioInputSelector);
            const portfolioInput = await page.$(portfolioInputSelector);
            console.log('uploading portfolio')
            await portfolioInput.uploadFile(resumeFilePath);
            continue;
         }
        const context = JSON.stringify(applicantData); // Convert applicant data to a string
        const bestPracticeText = JSON.stringify(bestPractices);
        const answerOptions = field.answers.map(a => a.value).join(", "); // Create a string of answer options

        // Construct a prompt that includes the answer options
        const prompt = `Given the context: ${context}, and the answer options: ${answerOptions}, what is the best answer for the question: ${field.question}? Use these best practices ${bestPracticeText}`;
        console.log("Question: ", field.question);
        const answer = await getAnswerFromGPT(prompt);
        console.log("GPT Answer:", answer);

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
                //console.log('This is option.value:', option.value);
                if (isMatch(option.value, answer)) {
                    if (option.type === "radio" || option.type === "checkbox") {
                        // Click the radio button or checkbox
                        const selector = `input[name="${option.name}"][value="${option.value}"]`;
                        console.log("Attempting to click on selector:", selector);
                        await page.waitForSelector(selector, { visible: true });
                        await page.click(selector);
                    }
                    // Add logic for other types of fields if necessary
                    //break; // removing break because some questions with checkbox may want more than 1 answer selected
                }
            }
        }
    }
}
function isMatch(optionValue, answer) {
    // Normalize both strings
    const normalize = (str) => str.toLowerCase().trim();

    const normalizedOptionValue = normalize(optionValue);
    const normalizedAnswer = normalize(answer);

    // Check if one string contains the other
    return normalizedAnswer.includes(normalizedOptionValue) || normalizedOptionValue.includes(normalizedAnswer);
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
async function clickApplyButton(buttonName, page){
    try{
        const applyButtonSelect = buttonName;
        await page.waitForSelector(applyButtonSelect, {visible :true});
        const applyButton = await page.$(applyButtonSelect);
        if (!applyButton) {
            console.log("Apply button not found. Exiting function.");
            return; // exit incase not found so that this function doesn't hang
        }
        

        await page.click(applyButtonSelect);

        console.log("Clicked on apply button to access job form");
    }catch(error){
        console.error("Error in function:clickApplyButton() clicking on the Apply button:", error);
    }
}
// Define a function to apply to jobs
async function applyToJobs(resumeFilePath) {
    for (let job of jobApplications) {
        if (job.url.includes('workable.com')) {
            await workableJob(job, resumeFilePath);
        } else if (job.url.includes('lever.co')) {
            await leverJob(job, resumeFilePath);
        } else if (job.url.includes('greenhouse.io')) {
            await greenhouseJob(job, resumeFilePath);
        }       
        //break;
    }
}
async function workableJob(job, resumeFilePath){
    console.log('Platform: Workable');
    const browser = await puppeteer.launch({ 
        headless: false, 
        executablePath: "C:/Program Files/Google/Chrome Dev/Application/chrome.exe"
    });

    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    try {
        console.log("Navigating to URL:", job.url);
        await page.goto(job.url, { waitUntil: 'domcontentloaded' });

        await clickApplyButton("a.button--2de5X", page);

        // Upload the resume
        // Selector for the button that triggers the file input
        const triggerButtonSelector = 'button.button--2de5X'; 
        await page.waitForSelector(triggerButtonSelector); 
        await page.click(triggerButtonSelector);

        // Wait for any JavaScript actions triggered by the button click to complete
        await page.waitForTimeout(1000); // Adjust the timeout as necessary

        // Selector for the file input
        const fileInputSelector = 'input#file-upload[type="file"]';
        await page.waitForSelector(fileInputSelector); // This waits for the element to be present in the DOM

        // Upload the file
        const fileInput = await page.$(fileInputSelector);
        console.log('Uploading resume');
        await fileInput.uploadFile(resumeFilePath);
        
        console.log("Completed form filling. Wait for 30 seconds");
        await page.waitForTimeout(30000); // waits for 30 seconds

        
        const selectors = [
           //".styles--1jc0L",
           //".styles--3JEd1",
        ];
    
        //const requiredFields = await findRequiredFieldsWorkable(page, selectors);
        //console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

        //await processQuestionsWorkable(requiredFields, applicantData, page, resumeFilePath);
        return;
        // Uncomment below lines to submit the form and take a screenshot
        const submitButtonSelector = '#btn-submit';
        await page.waitForSelector(submitButtonSelector, { visible: true });
        await page.click(submitButtonSelector);
        await page.waitForTimeout(30000); // waits for 30 seconds

    } catch (error) {
        console.error("An error occurred on URL:", job.url, error);
        await page.screenshot({ path: `error-${job.url.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
    }

    await browser.close();
}

async function greenhouseJob(job, resumeFilePath){
    console.log('Platform: Greenhouse');
}

async function leverJob(job, resumeFilePath) {
    const browser = await puppeteer.launch({ 
        headless: false, 
        executablePath: "C:/Program Files/Google/Chrome Dev/Application/chrome.exe"
    });

    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    try {
        console.log("Navigating to URL:", job.url);
        await page.goto(job.url, { waitUntil: 'domcontentloaded' });

        await clickApplyButton("a.postings-btn", page); // thats name for those button in lever.co
        const selectors = [
            '.application-question.custom-question',
            '.application-question', 
            '.content-wrapper application-page',
            '.content',
            '.section-wrapper',
        ];
    
        const requiredFields = await findRequiredFields(page, selectors);
        console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

        await processQuestions(requiredFields, applicantData, page, resumeFilePath);

        // Upload the resume
        const resumeInputSelector = 'input[type="file"][name="resume"]';
        await page.waitForSelector(resumeInputSelector);
        const resumeInput = await page.$(resumeInputSelector);
        console.log('Uploading resume');
        await resumeInput.uploadFile(resumeFilePath);
        
        // Fill in additional fields if empty
        await fillFieldIfEmpty(page, 'input[name="name"]', applicantData.name);
        await fillFieldIfEmpty(page, 'input[name="email"]', applicantData.email);
        await fillFieldIfEmpty(page, 'input[name="phone"]', applicantData.phone_number);
        await fillFieldIfEmpty(page, 'input[name="urls[Portfolio]"]', applicantData.portfolio_link);

        console.log("Completed form filling.");
        return;
        // Uncomment below lines to submit the form and take a screenshot
        const submitButtonSelector = '#btn-submit';
        await page.waitForSelector(submitButtonSelector, { visible: true });
        await page.click(submitButtonSelector);
        await page.waitForTimeout(30000); // waits for 30 seconds

    } catch (error) {
        console.error("An error occurred on URL:", job.url, error);
        await page.screenshot({ path: `error-${job.url.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
    }

    await browser.close();
}

async function fillFieldIfEmpty(page, selector, value) {
    const isEmpty = await page.$eval(selector, (el) => el.value === '');
    if (isEmpty) {
        await page.type(selector, value, { delay: 100 });
    }
}

// Run the function
//applyToJobs();

export default applyToJobs;