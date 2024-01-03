const jobApplications = [

//{ url: "https://jobs.lever.co/platform-stud/9a8b8278-5ebe-4e6e-8109-c2e00876751e/apply/" }, // everything filled correctly and submitted
//{ url: "https://jobs.lever.co/loopreturns/9bce9d58-6c08-4c99-ba33-1f78da7691b3/apply" }, //everything filled correctly but then captcha
//{ url: "https://jobs.lever.co/zuru/2881367a-e584-44e2-ac73-dca4bbed73d9/apply" }, //everything filled correctly but then captcha
//{url: "https://jobs.lever.co/matchgroup/3fec4bc1-c1b9-4c61-8716-b6a9e9cdbaad/apply" }, //av: some required checkboxes left answered
// applied ** phone number got messed up { url: "https://jobs.lever.co/blinkux/ef8be1e6-111f-4429-91a8-63482c2b7cb5/apply?lever-origin=applied&lever-source%5B%5D=weloveproduct.co" }, av: same as first
//applied 
//{ url: "https://jobs.lever.co/evisort-2/7d3add67-4d92-4bf6-aa43-f2b44b2c0866/apply" }, //av: same as first
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
//{url: "https://apply.workable.com/clayglobal/j/00E28EAE0F/apply/"}, // fill everything 
//{ url: "https://apply.workable.com/digital-waffle-2/j/A2C1F8B219/apply/" }, // fills everything
//{ url: "https://apply.workable.com/otiv/j/957F3CDC01/" }, // fills everything
//{ url: "https://apply.workable.com/second-bind/j/13D0FAAE40/" }, // fills everything, gpt answered correctly (1st: wrong, 2nd: right)
//{ url: "https://apply.workable.com/unreal-gigs/j/40E5B5B1E1/" }, // fills everything
//{ url: "https://apply.workable.com/twine/j/B9A33D7A79/" }, // fills everything
//{ url: "https://apply.workable.com/droids-on-roids-1/j/7BE4172A4B/" }, //fills everything
//{ url: "https://apply.workable.com/trademaniaapp/j/28D0A2346B/" }, //fills everything
//{ url: "https://apply.workable.com/blackstone-eit-2/j/9876B5CCDA/" }, // fills everything
//{ url: "https://apply.workable.com/leadtech/j/715C823430/apply/" }, // fills everything except dropdown menu, which it doesn't even catch
//{ url: "https://apply.workable.com/twine/j/AB5C3B58F5/" }, //fills everything
//{ url: "https://apply.workable.com/rebellion/j/26C3E166B4/" } // this application opens the company's page and share card, (maybe to prevent bots?)
//{url: "https://jobs.lever.co/highwirepr/07dcb8c1-a0e5-4af8-9ee1-dd2d5dce943e"}, //everything is fulled here correctly
//{url: "https://boards.greenhouse.io/faire/jobs/7066790002"},
//{url: "https://jobs.lever.co/vrchat/4b69c06d-3cf4-4343-a19f-735fa3087f47"}, // almost  everything is filled except for a file upload for sharing of portfolio
  


//{ url: "https://boards.greenhouse.io/rvohealth/jobs/4352369005" },
//{ url: "https://boards.greenhouse.io/affirm/jobs/5826511003" },
//{ url: "https://boards.greenhouse.io/lastpass/jobs/4351184005" },
//{ url: "https://boards.greenhouse.io/axon/jobs/5730344003?t=e4ea2ebb3us" }, // this one has some other stuff im not sure if we want to auto fill those
//{ url: "https://boards.greenhouse.io/affirm/jobs/5826513003" },
//{ url: "https://boards.greenhouse.io/hugeinc/jobs/5552876" },
//{ url: "https://boards.greenhouse.io/flohealth/jobs/5837145003?utm_source=The+FutureList+job+board&utm_medium=getro.com&gh_src=The+FutureList+job+board" },
//{ url: "https://boards.greenhouse.io/onetrust/jobs/5582677" },
//{ url: "https://boards.greenhouse.io/diligentcorporation/jobs/5037623004" },
//{ url: "https://boards.greenhouse.io/webflow/jobs/5578685" }


/** Lever jobs batch test (30 links) */
//{ url: "https://jobs.lever.co/coforma/f3bb020d-54f8-4673-9514-321114b1eb60" },
//{ url: "https://jobs.lever.co/woven-by-toyota/091129c9-95a0-4011-b34d-95ba32b05039" }, // everything filled and submitted?
//{ url: "https://jobs.lever.co/plailabsinc/be43d908-882c-4916-920e-f9c77fed7ec7?lever-origin=applied&lever-source%5B%5D=a16z" },
//{ url: "https://jobs.lever.co/xagroup/0062c6c3-6c29-461d-bfd3-eff5aee7f470" }, // filled and captcha'd
{ url: "https://jobs.lever.co/binance/6ca979a8-0b6a-4659-a63f-ff8ff7ae6087" }, // filled and
/*{ url: "https://jobs.lever.co/codecombat/256f6739-73e7-4553-bd40-164a92dd5644" },
{ url: "https://jobs.lever.co/pachama/9e9cd21e-ba32-4c59-a05e-2ae40104de92" },
{ url: "https://jobs.lever.co/sonatype/a8dfc062-9a9a-40ee-a89e-d367d46cd8ae" },
{ url: "https://jobs.lever.co/finix/bad62268-0c03-4c8e-be1c-c1ce9fdf40fd" },
{ url: "https://jobs.lever.co/sanas.ai/c7cfe1f3-d44b-4c35-a03e-ce34d021a238" },
{ url: "https://jobs.lever.co/finix/bad62268-0c03-4c8e-be1c-c1ce9fdf40fd" },
{ url: "https://jobs.lever.co/haus/f80629b9-5fcf-4cc9-ae16-fdc6f93c593a" },
{ url: "https://jobs.lever.co/hyperscience/3b0a2f9c-98f2-42c3-bef6-46c206da83be" },
{ url: "https://jobs.lever.co/ledger/5ecd9c1f-2155-4348-8399-663601524a50" },
{ url: "https://jobs.lever.co/askfavor/d69d3f92-a737-479d-b72c-895956c56c41" },
{ url: "https://jobs.lever.co/binance/6ca979a8-0b6a-4659-a63f-ff8ff7ae6087/apply" },
{ url: "https://jobs.lever.co/revefi/ae80f838-35ab-4992-bc57-4af3816c2dbb/apply" },
{ url: "https://jobs.lever.co/goswift/18f3e68b-e488-442c-8c76-52457e61023a" },
{ url: "https://jobs.lever.co/formulamonks/ac23a6ff-781f-413a-9749-ae24f94fbbe6" },
{ url: "https://jobs.lever.co/ledger/5ecd9c1f-2155-4348-8399-663601524a50/apply" },
{ url: "https://jobs.lever.co/tripalink/2b2897fd-e236-4b2c-9e56-11ec3f9c38c3/apply" },
{ url: "https://jobs.lever.co/veepee/8144ffd2-c5a7-4b4b-af07-9e458e56acaa" },
{ url: "https://jobs.lever.co/Allata/10e9cc78-dfb7-45b5-8237-9a9248a492a3?utm_source=remote_rocketship&ref=remote_rocketship" },
{ url: "https://jobs.lever.co/Instrumentl/c422f3ab-d3ea-4ac4-a923-3026b5cc9df7/apply" },
{ url: "https://jobs.lever.co/payfit/a7e1532f-647c-458c-8c6d-6f717c67993a" },
{ url: "https://jobs.lever.co/newton/6a267e12-15b6-4b88-abfd-276fd0ddc297" },
{ url: "https://jobs.lever.co/varomoney/154cd830-0024-4887-80a9-c9e0d074f0cc?ref=levels.fyi&src=levels.fyi&utm_source=levels.fyi&lever-origin=applied&lever-source%5B%5D=levels.fyi" },
{ url: "https://jobs.lever.co/golfscopeinc/5067cbfd-2620-4c1d-ac58-ac75346ccd16" },
{ url: "https://jobs.lever.co/hiver/64ab793e-b29a-4cdc-91bd-6b299c218288/apply" },
{ url: "https://jobs.lever.co/drivemode/bbbb7b6b-5477-4536-a585-dacb416afa8c/apply" },

*/

//{ url: "https://apply.workable.com/faroutscout/j/337D0AF6DE/" }, // asked for portfolio upload
//{ url: "https://apply.workable.com/trademaniaapp/j/28D0A2346B" }, // filled and submitted
//{ url: "https://apply.workable.com/liminalcustody/j/05587980FF/" }, // filled everything but answered 1 yes or no as true or false 
//{ url: "https://apply.workable.com/700apps-2/j/04E20A2228/" }, // filled and submitted
//{ url: "https://apply.workable.com/anovip-3/j/D140F83B91" }, // filled and submitted
//{ url: "https://apply.workable.com/escape-velocity-entertainment-inc/j/71209AD993/apply" }, //filled and submitted
//{ url: "https://apply.workable.com/futureverse/j/0D9A81191B/" }, // some anti bot activity
//{ url: "https://apply.workable.com/j/F08F5E8E61/apply?utm_source=Flexaapplication" }, // answered yes or no with number
//{ url: "https://apply.workable.com/blackstone-eit-2/j/73A8CAF739/" }, // answer true false as yes no, and answered a sentence when asked to respond between 1 to 5.
//{ url: "https://apply.workable.com/therapynotes/j/31A91C8B73/apply/" }, // portfolio upload problem
//{ url: "https://apply.workable.com/evolving-web/j/2BC934FFA0/" }, // true false answered yes no
//{ url: "https://apply.workable.com/700apps-2/j/04E20A2228/apply/" }, // answered full sentence instead of number
//{ url: "https://apply.workable.com/hownow/j/F08F5E8E61" }, //anti bot measures
//{ url: "https://apply.workable.com/rebellion/j/26C3E166B4/" }, // anti bot measures
//{ url: "https://apply.workable.com/jeeny/j/261A3E0BC5/" }, // yes no true false problem
//{ url: "https://apply.workable.com/userbrain/j/7C08039EF1/" },//everything filled and answered correctly, but dropdown didn't work 

//{ url: "https://apply.workable.com/evolving-web/j/740543C681/" }, //out of character responses by gpt
//{ url: "https://apply.workable.com/anovip-3/j/D140F83B91/apply/" }, //filled and submitted
//{ url: "https://apply.workable.com/lawnstarter/j/1128A68ED5" },
/*{ url: "https://apply.workable.com/lawnstarter/j/828DA48A08" },
{ url: "https://apply.workable.com/eventogy/j/F5067ADED9/" },
{ url: "https://apply.workable.com/yodeck/j/818C530FC8/" },
{ url: "https://apply.workable.com/mat3ra/j/045AD576C2/apply/" },
{ url: "https://apply.workable.com/questronix-corporation-2/j/8472836B9F/" },
{ url: "https://apply.workable.com/digital-waffle-2/j/4C8C92584B/" },
{ url: "https://apply.workable.com/twinkl-ltd/j/931FD1B820/" },
{ url: "https://apply.workable.com/digital-waffle-2/j/5EDFBE2F8F/" },
{ url: "https://apply.workable.com/unison-consulting-pte-ltd/j/F647C9EF09/" },
{ url: "https://apply.workable.com/evolving-web/j/347FAD3AAC/" },
{ url: "https://apply.workable.com/twinkl-ltd/j/931FD1B820/apply/" },
*/










];
  export default jobApplications;