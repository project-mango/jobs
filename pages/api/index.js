import applyToJobs from '@/app/lib/applyToJobs';
import downloadResume from '@/app/lib/downloadResume';
import applicantData from '@/app/data/ApplicantData';

//const applyToJobs = require('..applyToJobs.js');

export default async function handler(req, res) {
  if (req.method === 'POST') {
        try {
            //console.log("huh")
            const resumeUrl = applicantData.resume_link; // URL of the resume
           //console.log(resumeUrl)
            const downloadFolder = './temp'; // Folder for the downloaded file
            const resumeFilePath = await downloadResume(resumeUrl, downloadFolder);
            //console.log(resumeFilePath);
           await applyToJobs(resumeFilePath);
           //console.log(123123)
            res.status(200).json({ message: 'Job applications started' });
        } catch (error) {
            res.status(500).json({ message: 'Error applying to jobs', error: error.message });
        }
    } else if (req.method === 'GET') {
        // Respond to GET requests with a simple message
        res.status(200).send("hi");
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}