import tap from "tap";
import fs from "node:fs";

let rootURL = "http://localhost:4500/";

let APIcallsSLO = [
  "doel", 
  "niveau", 
  "doelniveau",
  "vakleergebied",
  "kerndoel_vakleergebied", //Kerndoelen
  "kerndoel_domein",
  "kerndoel",
  "kerndoel_uitstroomprofiel",
  "examenprogramma", //ExamenProgramma
  "examenprogramma_vakleergebied",
  "examenprogramma_domein",
  "examenprogramma_subdomein",
  "examenprogramma_eindterm",
  "examenprogramma_bg_profiel", // examenProgamma-bg
  "examenprogramma_bg_kern",
  "examenprogramma_bg_kerndeel",
  "examenprogramma_bg_globale_eindterm",
  "examenprogramma_bg_module",
  "examenprogramma_bg_keuzevak",
  "examenprogramma_bg_deeltaak",
  "examenprogramma_bg_moduletaak",
  "examenprogramma_bg_keuzevaktaak",
  //"syllabus",// curriculum-syllabus //gives an array instead of a JSON file
  "syllabus_vakleergebied",
  "syllabus_specifieke_eindterm",
  "syllabus_toelichting",
  "syllabus_vakbegrip",
  "ldk_vakleergebied", //curriculum-leerdoelenkaarten
  "ldk_vakkern",
  "ldk_vaksubkern",
  "ldk_vakinhoud",
  "ldk_vakbegrip",
  "inh_vakleergebied", //curriculum-inhoudslijnen/
  "inh_inhoudslijn",
  "inh_cluster",
  //"inh_subcluster", //gives an array instead of a JSON file
  "ref_vakleergebied", //curriculum-referentiekader/
  "ref_domein",
  "ref_subdomein",
  "ref_onderwerp",
  "ref_deelonderwerp",
  "ref_tekstkenmerk",
  "erk_vakleergebied", //curriculum-erk
  "erk_gebied",
  "erk_categorie",
  "erk_taalactiviteit",
  "erk_schaal",
  "erk_candobeschrijving",
  "erk_voorbeeld",
  "erk_lesidee"
  //niveau hierarchie
];

async function getData(url = "", data = {}) {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Authorization": "Basic b3BlbmRhdGFAc2xvLm5sOjM1ODUwMGQzLWNmNzktNDQwYi04MTdkLTlmMGVmOWRhYTM5OQ=="
    },
  });
  
  return await response.json(); 
}

//Check whether the API call and resulting files are identical
for (let call of APIcallsSLO){
  let APICallData= JSON.parse(fs.readFileSync(process.cwd() + "/test/data/UUIDs/" + call + ".json"));

  tap.test((call + 'identical json check'), async t => {
      let found = await getData(rootURL + call + "/");
      let wanted =  APICallData; 
      t.same(found, wanted)
      t.end();
  })
}
