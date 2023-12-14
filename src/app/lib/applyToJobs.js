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

    return fieldDetails;
}

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

// Define a function to apply to jobs
async function applyToJobs(resumeFilePath) {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false }); // 'headless: false' allows you to see the browser action
    const page = await browser.newPage();

      // Set a realistic user agent
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
      await page.setUserAgent(userAgent);
  

    for (let job of jobApplications) {
        try {
            
            // Open the job application URL
            console.log("Navigating to URL:", job.url);
            await page.goto(job.url, { waitUntil: 'networkidle2' });

             // Get required fields
             const requiredFields = await findRequiredFields(page);
             console.log("Required Fields:", JSON.stringify(requiredFields, null, 2));

             //For each field - call gpt function -- pass through the answer options so that we can come 
            // back here and use that answer option to select the right answer
            await processQuestions(requiredFields, applicantData, page);

            console.log('starting 10 second wait')
            await page.waitForTimeout(10000);

             // Upload the resume
             
             const resumeInputSelector = 'input[type="file"][name="resume"]';
             await page.waitForSelector(resumeInputSelector);
             const resumeInput = await page.$(resumeInputSelector);
             console.log('uploading resume')
             await resumeInput.uploadFile(resumeFilePath);
             await page.waitForTimeout(5000); // waits for 5 seconds

             // Function to fill in the field if it is empty
            async function fillFieldIfEmpty(page, selector, value) {
                 const isEmpty = await page.$eval(selector, (el) => el.value === '');
                 if (isEmpty) {
                      await page.type(selector, value, { delay: 100 });
                    }
            }


        // Fill in the name field if empty
        const nameFieldSelector = 'input[name="name"]';
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
        await fillFieldIfEmpty(page, portfolioFieldSelector, applicantData.portfolio_link);

             await page.waitForTimeout(3000);

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
    }

    await browser.close();
}

// Run the function
//applyToJobs();

export default applyToJobs;
