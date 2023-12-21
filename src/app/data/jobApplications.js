const jobApplications = [
   // av = ashish version
// { url: "https://jobs.lever.co/platform-stud/9a8b8278-5ebe-4e6e-8109-c2e00876751e/apply/" }, // av: fills the required fields and resume autofiller adds some more things
   // unsucessful { url: "https://jobs.lever.co/loopreturns/9bce9d58-6c08-4c99-ba33-1f78da7691b3/apply" }, // av: same as above. except email answer had ":" in the start
//{ url: "https://jobs.lever.co/zuru/2881367a-e584-44e2-ac73-dca4bbed73d9/apply" }, //av: same as first
// applied { url: "https://jobs.lever.co/careernowbrands/f0a455f2-7bf6-40cc-a816-20595cdb0a64/apply?lever-source=Job%20postings%20feed" }, // av: one required checkbox was not caught
// did not apply {url: "https://jobs.lever.co/matchgroup/3fec4bc1-c1b9-4c61-8716-b6a9e9cdbaad/apply" }, //av: some required checkboxes left answered
// applied ** phone number got messed up { url: "https://jobs.lever.co/blinkux/ef8be1e6-111f-4429-91a8-63482c2b7cb5/apply?lever-origin=applied&lever-source%5B%5D=weloveproduct.co" }, av: same as first
//applied { url: "https://jobs.lever.co/evisort-2/7d3add67-4d92-4bf6-aa43-f2b44b2c0866/apply" }, av: same as first
//{ url: "https://jobs.lever.co/cgsfederal/aaf0e05b-2371-4086-b39e-24f88d2d1511/apply" }, //av:dropdown doesn't work.  rest is good.
// applied { url: "https://jobs.lever.co/careernowbrands/f0a455f2-7bf6-40cc-a816-20595cdb0a64/apply?lever-source=Job%20postings%20feed" },
// put the answer to a question in the wrong field { url: "https://jobs.lever.co/timelycare/7060cb75-3d59-4bff-b711-c98a2cf9c0b7/apply" }, //av: answers everything except dropdown menu
// crashes after resume upload { url: "https://jobs.lever.co/cgsfederal/a5f1fc8f-7b49-4aef-877b-84ed1fbe3739/apply" }, //  av: everything works except dropdown menu
// job post closed { url: "https://jobs.lever.co/graylog/fb6823d5-6ddd-4ca4-b40c-a6bdb62e086f/apply?utm_source=remote_rocketship&ref=remote_rocketship" },
// requires captcha { url: "https://jobs.lever.co/matchgroup/3fec4bc1-c1b9-4c61-8716-b6a9e9cdbaad/apply" }, // av: answers everything
// resume fills and submits, but resume tab is clicked open { url: "https://jobs.lever.co/timelycare/7060cb75-3d59-4bff-b711-c98a2cf9c0b7/apply" }, av: everything except dropdown

// application below, at first caught no required fields. uploads resume, which then fills required fields and submits
//{ url: "https://jobs.lever.co/cgsfederal/95a7ece8-f494-4b42-bd81-f7bc98739fe9" }, av: everything except dropdown

//{ url: "https://jobs.lever.co/loopreturns/9bce9d58-6c08-4c99-ba33-1f78da7691b3?utm_source=himalayas.app&utm_medium=himalayas.app&utm_campaign=himalayas.app&ref=himalayas.app&source=himalayas.app&lever-origin=applied&lever-source%5B%5D=himalayas.app&lever-requisition-name=himalayas.app&lever-posting-owner-name=himalayas.app&lever-source=himalayas.app&lever-referer=himalayas.app" }, av: answers everything except for one radio where gpt respended with No. and not No
//{ url: "https://jobs.lever.co/slangai/270ecc9f-ae7a-4d57-9504-7abb37bf196e/apply" }, av: everything work except gpt is answering No instead of NO
//{ url: "https://jobs.lever.co/fluence/6714c30a-c83f-411a-8946-ce8c85ad2df7" }, av: didn;t catch work auth which was required, everything was fine
// no longer a job post { url: "https://jobs.lever.co/SeiLabs/f5c85081-3d9c-4872-8990-44a0983c4089" },
//{ url: "https://jobs.lever.co/wmg/290883fc-a397-413a-909c-5f6cf753acd9" }, av: fills everything except unclicked captcha at the end
// { url: "https://jobs.lever.co/safe/5fc2f0d3-b341-4e09-afe7-4479f3bea690" }, av: fills everything
// { url: "https://jobs.lever.co/blinkux/45737536-9fb8-4742-a3b1-808e74af6be0" }, av: fills everything
// { url: "https://jobs.lever.co/vida/e907125c-5a27-433d-a321-86997a2cd9c9" }, av: one option matching problem, didn't happene with other options 
// { url: "https://jobs.lever.co/tecton/37517ded-22e4-4028-92e0-f02b205982a9" }, av: fills everything 
// { url: "https://jobs.lever.co/super-com/b5f5b4d6-e1ac-45ac-b9f1-d0f3810e1bec" }, av: fills everything
// { url: "https://jobs.lever.co/inato/7628bce9-fdbc-43ef-aba7-771f3140c9ae" }, av: gpt threw a ? before giving linkedin url. rest was fine
// { url: "https://jobs.lever.co/G2i/6f97b873-e800-44de-858d-883c830be79a?utm_source=remote_rocketship&ref=remote_rocketship" }, av: filled everything, except one incomplete gpt sentence  "Additionally, "
// { url: "https://jobs.lever.co/super-com/7948f009-c6a9-44d6-98fa-d9530c7660c8" }, av: fills everything, gpt threw more question marks
// { url: "https://jobs.lever.co/super-com/bfa8244c-0490-42b9-afa8-925d896d210c" }, av: fills everything, didn't fill an option because gpt added . to the front of it's response for that option
// { url: "https://jobs.lever.co/super-com/6e0afa63-ed0e-4e81-9f27-4bdef8a72337" }, av: same as above
// { url: "https://jobs.lever.co/ellevationeducation/0491230c-fcb5-4a43-b4bc-188417681234" },av: did not catch dropdown and  a singular chekcbox statement as a requied field
// { url: "https://jobs.lever.co/coffeemeetsbagel/6836415b-8886-4640-ab2c-724acfe8aa04" }, av: gpt answered more than the option provided
// { url: "https://jobs.lever.co/theathletic/a0b6a1eb-7278-43f3-9108-3ed26145c55e" } av: gpt added a semicolon in email and same as above
    // ... more applications
// {url: "https://jobs.lever.co/highwirepr/c5f6c5c7-4e40-4dfb-88f1-1800c5b66f03"}, // everything is filled here correctly
// {url: "https://jobs.lever.co/webfx/3da2493f-f66d-4a43-a910-51181d51fa50"}, // everything is filled here correctly
// {url: "https://jobs.lever.co/webfx/0aca85ec-fc25-4cd2-ae4a-43d81301779f"}, // everything is filled here correctly
// {url: "https://jobs.lever.co/highwirepr/2b6519dd-e2cd-423a-a87c-86585bd79987"}, //everything is filled here correctly
// {url: "https://jobs.lever.co/highwirepr/5ebde23e-fa4d-4846-bb57-c474bb14a78c"}, //everything is filled here correctly
// {url: "https://jobs.lever.co/hopper/e19d4426-b66e-4c6c-96d3-cb17df7b6f06"}, //everything is filled here correctly
// {url: "https://jobs.lever.co/Traba/e2efe435-99b2-4b0b-b8c5-e9f9fe5be924"}, //everything is filled here correctly
// {url: "https://jobs.lever.co/StubHub/42f4880d-7fb9-4a3c-8e89-95888506827e"}, // everything fill here correctly
// {url: "https://jobs.lever.co/wealthfront/dd0e2b58-85d5-413e-ba7f-b3e4f17b0832"}, // one response was wrong with else was correctly filled

//{url: "https://jobs.lever.co/highwirepr/c5f6c5c7-4e40-4dfb-88f1-1800c5b66f03"}, // everything is filled here correctly
//{url: "https://apply.workable.com/clayglobal/j/00E28EAE0F/apply/"},
//{ url: "https://apply.workable.com/digital-waffle-2/j/A2C1F8B219/apply/" }, // fills everything
{ url: "https://apply.workable.com/otiv/j/957F3CDC01/" },
//{ url: "https://apply.workable.com/second-bind/j/13D0FAAE40/" },
//{ url: "https://apply.workable.com/unreal-gigs/j/40E5B5B1E1/" }, // fills everything
//{ url: "https://apply.workable.com/twine/j/B9A33D7A79/" }, // fills everything
//{ url: "https://apply.workable.com/droids-on-roids-1/j/7BE4172A4B/" },
//{ url: "https://apply.workable.com/second-bind/j/13D0FAAE40/apply/" },

//{url: "https://jobs.lever.co/highwirepr/07dcb8c1-a0e5-4af8-9ee1-dd2d5dce943e"}, //everything is fulled here correctly
//{url: "https://boards.greenhouse.io/faire/jobs/7066790002"},
//{url: "https://jobs.lever.co/vrchat/4b69c06d-3cf4-4343-a19f-735fa3087f47"}, // almost  everything is filled except for a file upload for sharing of portfolio
  

];
  export default jobApplications;