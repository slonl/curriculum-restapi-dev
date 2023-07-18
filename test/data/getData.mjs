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
  // "syllabus",// curriculum-syllabus // does not give a compatible JSON file
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
  // "inh_subcluster", // does not give a compatible json file.
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

async function gettheJSONData(call){
  let data = await getData(rootURL + call + "/");
  if(JSON.stringify(data)){
    console.log("busy with " + call);
    fs.writeFileSync((process.cwd() + "/pages/" + call + ".json"), JSON.stringify(data));
  }
  else {
    console.log("could not write " + call); 
  }
}

// go get the files using the rest API
for (let call of APIcallsSLO){
  gettheJSONData(call);
}
