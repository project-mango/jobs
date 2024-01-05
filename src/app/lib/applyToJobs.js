//import puppeteer from 'puppeteer';
//import jobApplications from '../data/jobApplications.js';
//import applicantData from '../data/ApplicantData.js';
import bestPractices from '../data/bestPractices.js';
import getAnswerFromGPT from './getAnswerFromGPT.js';

// Import puppeteer-extra and the stealth plugin
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import applicantData from '@/app/data/applicants';
import jobApplications from '@/app/data/applicants';

//minor change

// Apply the stealth plugin
puppeteer.use(StealthPlugin());
    
    //fetchData();






async function findRequiredFields(page, selectors) {
    // wait for form to load
    await page.waitForSelector('form');
    const form = await page.$('form');
    // check if form exists incase of bug
    if (!form) {
        console.log('No form found on the page. ');
        return [];
    }
    
    let processedContainers = new Set();
    let requiredFieldContainers = [];

    // Try each selector
    for (const selector of selectors) {
        const containers = await page.$$(selector);
        for (const container of containers) {
            requiredFieldContainers.push(container);
            const containerId = await container.evaluate(node => node.id || node.name);
            console.log(containerId);
            if (!processedContainers.has(containerId)) {
                
                processedContainers.add(containerId);
            }
        }
    }

    // If no fields found, return empty or a message
    if (requiredFieldContainers.length === 0) {
        return 'No required fields found';
    }
    // requiredFieldContainers = await page.$('#application-form');

    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        // Check for different indicators of required fields
        const isRequired = await container.evaluate(node => {
            return node.querySelector('input[required], textarea[required], select[required]') ||
                node.querySelector('[aria-required="true"], [data-required="true"]') ||
                node.textContent.includes('*') ||
                node.textContent.toLowerCase().includes('required') ||
                node.querySelector('[data-required="true"]') ||
                node.querySelectorAll('input[type="radio"][required], input[type="checkbox"][required], select[required]').length > 0;
        });

        if (!isRequired) {
            return null; // Skip if not marked as required
        }
        const textElement = await container.$('.text');
        let questionText = '';
        if (textElement) {
            questionText = await textElement.evaluate(el => el.innerText.trim());
        }

        // Handle input and textarea fields
        // Filter out already filled input and textarea fields
        const inputFields = (await container.$$('input, textarea'));

        let isFieldFilled = false;
        const inputAnswers = (await Promise.all(inputFields.map(async field => {
            const type = await field.evaluate(el => el.type || 'textarea');
            if (type === "text" || type === "textarea") {
                const name = await field.evaluate(el => el.name);
                const value = await field.evaluate(el => el.value);
                if (value.trim() !== '') {
                    return null; // Skip this text input/textarea field as it's already filled
                }
                return { name, value, type };
            } else {
                // For non-text input fields, just return their details without checking if they're filled
                const name = await field.evaluate(el => el.name);
                const value = await field.evaluate(el => el.value);
                return { name, value, type };
            }
        }))).filter(answer => answer !== null); // Remove nulls (skipped fields)
    

        // Skip the entire container if any text input/textarea is filled
        if (isFieldFilled) {
            return null;
        }

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
        const answers = [...inputAnswers, ...selectAnswers]

        return { question: questionText, answers };
    }));
    
    return fieldDetails.filter(field => field !== null);
    //return fieldDetails.filter(field => field !== null && (field.question !== null || field.question !== "") && field.answers.length > 0);
}

async function findRequiredFieldsWorkable(page, selectors) {
    // Wait for the form to load
    await page.waitForSelector('form');
    const form = await page.$('form');

    await page.waitForSelector('label');
    const label = await page.$('label');

    // Check if the form exists to handle potential errors
    if (!label) {
        console.log('No label found on the page.');
        return [];
    }
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
    }else{
        console.log("Containers found:"+ requiredFieldContainers.length);
    }

    // Extract field details, skipping already filled fields
    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        
        const questionTextHandle = await container.$('span.styles--3da4O');
        const questionText = questionTextHandle ? await page.evaluate(el => el.textContent, questionTextHandle) : '';

        // Check if it's a text input or radio button group
        const inputHandle = await container.$('input[type="text"], textarea[required]');
        const radioGroupHandle = await container.$('fieldset');
        const dropdownHandle = await container.$('div[data-ui][data-input-type="select"]');
        
        if (inputHandle) {
            // Handle text input
            const name = await page.evaluate(el => el.name, inputHandle);
            const value = await page.evaluate(el => el.value, inputHandle);
            if (value !== '') return null;
            const type = await page.evaluate(el => el.type, inputHandle);

            return {
                question: questionText,
                answers: [{ name, value, type }]
            };
        } else if (radioGroupHandle) {
            // Handle radio group
            const radioButtons = await container.$$('input[type="radio"]');
            const answers = await Promise.all(radioButtons.map(async radioButton => {
                const name = await page.evaluate(el => el.name, radioButton);
                const value = await page.evaluate(el => el.value, radioButton);
                const type = await page.evaluate(el => el.type, radioButton);

                return { name, value, type };
            }));

            return {
                question: questionText,
                answers
            };
        } else {
            // No recognized input type found
            return null;
        }

    }));
    //console.log(fieldDetails.filter(detail => detail.answers.length > 0))
    return fieldDetails.filter(item => item);
}

async function findRequiredFieldsGreenhouse(page, selectors) {
    // Wait for the form to load
    await page.waitForSelector('form');
    const form = await page.$('form');

    await page.waitForSelector('label');
    const label = await page.$('label');

    // Check if the form exists to handle potential errors
    if (!label) {
        console.log('No label found on the page.');
        return [];
    }
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
    }else{
        console.log("Containers found:"+ requiredFieldContainers.length);
    }

    // Extract field details, skipping already filled fields
    const fieldDetails = await Promise.all(requiredFieldContainers.map(async container => {
        // Check if the container has an input with 'aria-required="true"'
        const isRequired = await container.$eval('[aria-required="true"]', () => true).catch(() => false);

        if (isRequired) {
            // Extract the label (question)
            const question = await container.$eval('label', label => label.innerText.trim());

           let name, type, value, options = [];

            // Extract the input field (e.g., for further actions like filling it out)
            const inputField = await container.$('input[aria-required="true"], textarea[aria-required="true"]');
            const selectField = await container.$('select')
             // Extract the field's name and type
             if (inputField) {
                // Extract name, type, and value from the input field
                let result = await inputField.evaluate(input => {
                    return {
                        name: input.name,
                        type: input.type,
                        value: input.value
                    };
                });
                //[name, type, value] = result;
                
                name = result.name;
                type = result.type;
                value = result.value;
                if (value && value.trim() !== '') {
                    console.log(`Field already filled: ${name}`);
                    return null; // Skip this field
                }
                //console.log(`Name: ${name}, Type: ${type}, Value: ${value}`);
            }else if(selectField){
                //create a list of answers where each option is stored like name, value and type
                const name = await selectField.evaluate(select => select.name);
                options = await selectField.$$eval('option', (opts, selectName) => opts
                    .filter(opt => opt.value.trim() !== '') // Filter out options with empty value
                    .map(opt => ({
                        name: selectName, // The name of the select, as each option doesn't have its own unique name
                        type: 'select',
                        value: opt.textContent.trim()
                    }))
                , name);
            }
            
            //console.log(question);
            return {
                question: question,
                answers: options.length > 0 ? options : [{
                    name: name,
                    value: value,
                    type: type
                }]
            };
            
        }
    }));
    return fieldDetails.filter(el=>el);
};


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
        const prompt = `Given the context: ${context}, and the answer options: ${answerOptions}, what is the best answer for the question: ${field.question}? Use bestPractices. ${bestPracticeText}`;
        console.log("Question: ", field.question);
        const answer = await getAnswerFromGPT(prompt);
        console.log("GPT Answer:", answer);

       // Check if the field is a textarea or an input
       if (field.question.includes("Location (City)")) {
        const autoCompleteInputSelector = `input[name="${field.answers[0].name}"]`;
        console.log("Handling autocomplete field:", autoCompleteInputSelector);
        await page.type(autoCompleteInputSelector, answer, { delay: 100 });
    
        // Adjust the below selector based on how suggestions are rendered in the DOM
        const suggestionsSelector = '#location_autocomplete-items-popup > li';
        await page.waitForSelector(suggestionsSelector, { visible: true });
        
        // Select the first suggestion or the closest match
        // This can be adjusted based on the specific implementation of the suggestions list
        const firstSuggestionSelector = `${suggestionsSelector}:first-child`;
        await page.click(firstSuggestionSelector);
    }else 
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
                    console.log('This is option.value:', option.value);
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

// a simple function for finding the "apply for this job" button
async function clickApplyButton(buttonName, page, timeout = 3000){
    try {
        const applyButtonSelect = buttonName;
        const check = await page.waitForSelector(applyButtonSelect, {timeout: timeout, visible: true});
        if (check) {
            const applyButton = await page.$(applyButtonSelect);
            if (!applyButton) {
                console.log("Apply button not found.");
                return; // Exit if not found to prevent hanging
            }
        } else {
            return;
        }

        await page.click(applyButtonSelect);
        console.log("Clicked on apply button to access job form");
    } catch (error) {
        console.log("An error occurred while clicking the apply button.");
    }
}

// Define a function to apply to jobs
async function applyToJobs(resumeFilePath) {
    await fetchData();
    await fetchData2();

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

async function fillIfEmpty(page, selector, dataToFillWith, timeout = 3000) {
    try {
        // Wait for the input element to be available, with a timeout
        await page.waitForSelector(selector, { timeout });

        // Check if the input field is empty
        const isEmpty = await page.evaluate(selector => {
            const inputElement = document.querySelector(selector);
            return inputElement && inputElement.value === '';
        }, selector);

        // If the input field is empty, fill it
        if (isEmpty) {
            await page.type(selector, dataToFillWith);
        }
    } catch (error) {
        // Log the error and continue execution if the selector doesn't exist or times out
        console.log(`Selector "${selector}" not found or timed out after ${timeout} ms.`, error.message);
    }
}

async function workableJob(job, resumeFilePath){
    console.log('Platform: Workable');
    const browser = await puppeteer.launch({ 
        headless: false, 
        //executablePath: "C:/Program Files/Google/Chrome Dev/Application/chrome.exe"
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

        console.log("Completed form filling. Wait for 10 seconds");
        await page.waitForTimeout(10000); // waits for 30 seconds

        await fillIfEmpty(page, `input[name='firstname'][required]`, applicantData.first_name);
        await fillIfEmpty(page, `input[name='lastname'][required]`, applicantData.last_name);
        await fillIfEmpty(page, `input[name='email'][required]`, applicantData.email);
        await fillIfEmpty(page, `input[name='phone'][required]`, applicantData.phone_number);
        await fillIfEmpty(page, `input[name='address'][required]`, applicantData.Location);
        
        

        
        const selectors = [
           //".styles--1jc0L",
           //".styles--3JEd1",
           //`span[class='styles--332ku']`,
           //"input[required]",
           //"div.styles--3aPac",

           //"div.styles--1jc0L",
           //"form.styles--2I-rr"
           "div.styles--3JEd1"
        ];
    
        const requiredFields = await findRequiredFieldsWorkable(page, selectors);
        console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

        try {
            // Selector for the portfolio file input
            const portfolioInputSelector = 'input[type="file"].styles--1lKzl';
            await page.waitForSelector(portfolioInputSelector, { timeout: 5000 }); // Waits for the element to be present in the DOM
        
            // Upload the file
            const portfolioInput = await page.$(portfolioInputSelector);
            console.log('Uploading portfolio');
            await portfolioInput.uploadFile(resumeFilePath);
        } catch (error) {
            console.log('Portfolio upload field not found or an error occurred:', error);
        }

        await processQuestions(requiredFields, applicantData, page, resumeFilePath);

        const checkboxSelector = 'input[name="gdpr"]';       
        const timeout = 5000;
        try {
            // Wait for the input element to be available, with a timeout
            await page.waitForSelector(checkboxSelector, { timeout });
            await page.click(checkboxSelector);
        } catch (error) {
            // Log the error and continue execution if the selector doesn't exist or times out
            console.log(`Selector "${checkboxSelector}" not found or timed out after ${timeout} ms.`, error.message);
        }
        //return;
        // Uncomment below lines to submit the form and take a screenshot
        console.log("Completed form filling. Going to submit in 30 seconds");
        await page.waitForTimeout(30000);
        const submitButtonSelector = '[data-ui="apply-button"]';

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
    const browser = await puppeteer.launch({ 
        headless: false, 
        //executablePath: "C:/Program Files/Google/Chrome Dev/Application/chrome.exe"
    });

    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    try {
        console.log("Navigating to URL:", job.url);
        await page.goto(job.url, { waitUntil: 'domcontentloaded' });

        await clickApplyButton("#apply_button", page);
        const selectors = [
            ".field",//`[aria-required="true"]`
        ];
  
        // Upload the resume
        const resumeInputSelector = 'input[type="file"][name="file"]';
        await page.waitForSelector(resumeInputSelector);
        const resumeInput = await page.$(resumeInputSelector);
        console.log('Uploading resume, 5 sec wait');
        await resumeInput.uploadFile(resumeFilePath);
        await page.waitForTimeout(5000); 
        // Fill in additional fields if empty
        await fillFieldIfEmpty(page, '#first_name', applicantData.first_name);
        await fillFieldIfEmpty(page, '#last_name', applicantData.last_name);
        await fillFieldIfEmpty(page, '#email', applicantData.email);
        await fillFieldIfEmpty(page, '#phone', applicantData.phone_number);
        

        //console.log("Completed form filling.");
        const requiredFields = await findRequiredFieldsGreenhouse(page, selectors);
        console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));
        await processQuestions(requiredFields, applicantData, page, resumeFilePath);
        const checkboxSelector = 'input[name="job_application[data_compliance][gdpr_processing_consent_given]"]';
        const timeout = 5000;
        try {
            // Wait for the checkbox element to be available, with a timeout
            await page.waitForSelector(checkboxSelector, { timeout });
            await page.click(checkboxSelector);
        } catch (error) {
            // Log the error and continue execution if the selector doesn't exist or times out
            console.log(`Selector "${checkboxSelector}" not found or timed out after ${timeout} ms.`, error.message);
        }
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

async function leverJob(job, resumeFilePath) {
    const browser = await puppeteer.launch({ 
        headless: false, 
        //executablePath: "C:/Program Files/Google/Chrome Dev/Application/chrome.exe"
    });

    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    try {
        console.log("Navigating to URL:", job.url);
        await page.goto(job.url, { waitUntil: 'domcontentloaded' });

        await clickApplyButton("a.postings-btn", page); // thats name for those button in lever.co
        await page.waitForTimeout(10000);
        // Upload the resume
        const resumeInputSelector = 'input[type="file"][name="resume"]';
        await page.waitForSelector(resumeInputSelector);
        const resumeInput = await page.$(resumeInputSelector);
        console.log('Uploading resume');
        await resumeInput.uploadFile(resumeFilePath);
        await page.waitForTimeout(30000);
        // Fill in additional fields if empty
        await fillIfEmpty(page, 'input[name="name"]', applicantData.name);
        await fillIfEmpty(page, 'input[name="email"]', applicantData.email);
        await fillIfEmpty(page, 'input[name="phone"]', applicantData.phone_number);
        await fillIfEmpty(page, 'input[name="urls[Portfolio]"]', applicantData.portfolio_link);
        
        const selectors = [
            'input[required], textarea[required], select[required]',
            'application-question custom-question',
            '.application-question.custom-question',
            '.application-question', 
            '.content-wrapper application-page',
            '.content',
            '.section-wrapper',
        ];
    
        const requiredFields = await findRequiredFields(page, selectors);
        console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

        await processQuestions(requiredFields, applicantData, page, resumeFilePath);

        

        console.log("Completed form filling. Going to submit in 30 seconds");
        await page.waitForTimeout(30000);
        // Uncomment below lines to submit the form and take a screenshot
        const submitButtonSelector = '#btn-submit';
        await page.waitForSelector(submitButtonSelector, { visible: true });
        await page.click(submitButtonSelector);
        await page.waitForTimeout(30000); // waits for 30 seconds
        return;

    } catch (error) {
        console.error("An error occurred on URL:", job.url, error);
        await page.screenshot({ path: `error-${job.url.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
    }

    await browser.close();
}

/*async function fillFieldIfEmpty(page, selector, value) {
    const isEmpty = await page.$eval(selector, (el) => el.value === '');
    if (isEmpty) {
        await page.type(selector, value, { delay: 100 });
    }
}*/

// Run the function
//applyToJobs();

export default applyToJobs;