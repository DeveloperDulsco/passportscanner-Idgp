
const settings = {
    hotelDomain: process.env.REACT_APP_HOTELDOMAIN,
    kioskId: process.env.REACT_APP_KIOSKID,
    systemType: process.env.REACT_APP_SYSTEMTYPE,
    language: process.env.REACT_APP_LANGUAGE,
    chainCode: process.env.REACT_APP_CHAINCODE,
    destinationEntityID: process.env.REACT_APP_DESTINATIONENTITYID,
    destinationSystemType: process.env.REACT_APP_DESTIONATIONSYSTEM,
    username: process.env.REACT_APP_USERNAME,
    password: process.env.REACT_APP_PASSWORD,
    DotsURL: process.env.REACT_APP_DOTSURL,
    scanningURL: process.env.REACT_APP_SCANNINGURL,
    legNumber:process.env.REACT_APP_LEGNUMBER
};



console.log('Settings:', settings); // Debugging
export default settings;
