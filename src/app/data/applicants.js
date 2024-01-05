import supabase from '../data/supabase.js';


let applicantData = [];
let jobApplications = [];

async function fetchData2() {
    let { data, error } = await supabase
        .from('jobs')
        .select('*')

    if (error) console.log('Error:', error)
    else {console.log('Jobs Data:', data); jobApplications = data}
}
async function fetchData() {
    let { data, error } = await supabase
        .from('applicants')
        .select('*')

    if (error) console.log('Error:', error)
    else {console.log('Applicant Data:', data); applicantData = data}

    
}

fetchData();
fetchData2();


