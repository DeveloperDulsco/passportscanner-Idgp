import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';

import './GuestDetails.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
//import settings from '../../app.settings';
import { toast, ToastContainer } from 'react-toastify'; // Ensure correct import
import 'react-toastify/dist/ReactToastify.css';
import { getConfig } from '../../config';
const fetchReservationData = async (reservationId) => {
    try {
        const config = getConfig();
        const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/'; 
        const fetchurl = config.DotsURL+'/api/ows/FetchReservation';
        const response = await fetch(fetchurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hotelDomain: config.hotelDomain,
                kioskID: config.kioskId,
                username: config.username,
                password: config.password,
                systemType: config.systemType,
                language: config.language,
                legNumber: config.legNumber,
                chainCode: config.chainCode,
                destinationEntityID: config.destinationEntityID,
                destinationSystemType: config.destinationSystemType,
                FetchBookingRequest: {
                    ReservationNameID: reservationId
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched reservation data:", data);
        return data;
    } catch (error) {
        console.error("Failed to fetch reservation data:", error);
        return null;
    }
};
export function GuestDetails({ adults,editroomNumber,IsAddGuestvisible,isVisible, guestData, reservationNumber, addGuest, isButtonClicked, onSave,onCancel }) {
    const { reservationId } = useParams();

    const [salutation, setSalutation] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [nationality, setNationality] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [givenName, setGivenName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [gender, setGender] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [placeOfIssue, setPlaceOfIssue] = useState('');
    const [documentImage, setDocumentImage] = useState(null);
    const [faceImage, setFaceImage] = useState(null);
    const [pmsProfileId, setPmsProfileId] = useState('');
    const [documentImage2, setDocumentImage2] = useState(null);
    const [nationalityList, setNationalityList] = useState([]);
    const [nationalityMapping, setNationalityMapping] = useState({});
    const [areButtonsVisible, setAreButtonsVisible] = useState(false);
    const [isCheckIn, setIsCheckIn] = useState(false);
    const [isCheckOut, setIsCheckOut] = useState(false);
    const [address, setAddress] = useState('');
    const [reservationNumberState, setReservationNumber] = useState('');
    const [reservationData, setReservationData] = useState({});
    const [backScanButtonClicked, setBackScanButtonClicked] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [loading, setLoading] = useState(true);
    const [documentTypeList, setDocumentTypeList] = useState([]);
    const [isVisibleSave, setisVisibleSave] = useState(true);
    useEffect(() => {
        if (reservationId) {      
            fetchReservationData(reservationId).then(data => {
                if (data && data.responseData && data.responseData.length > 0) {
                    setReservationData(data.responseData[0]);                  
                } else {
                    console.warn('No reservation data found');
                }
            }).catch(error => {
                console.error('Failed to fetch reservation data:', error);
            });

            const timer = setTimeout(() => {
                setLoading(false);
            }, 3000); // 3 seconds delay
    
        }
    }, [reservationId]);
    // useEffect(() => {
    //     if (guestData) {
    //         setPmsProfileId(guestData.PmsProfileID || '');
    //         setDocumentType(guestData.DocumentType || '');
    //         setNationality(guestData.Nationality || '');
    //         setDocumentNumber(guestData.PassportNumber || '');
    //         setDateOfBirth(displayDate(guestData.dateOfBirth || ''));
    //         setGivenName(guestData.FirstName || '');
    //         setMiddleName(guestData.MiddleName || '');
    //         setGender(guestData.Gender || '');
    //         setFamilyName(guestData.LastName || '');
    //         setIssueDate(guestData.IssueDate ? guestData.IssueDate.split('T')[0] : '');
    //         setExpiryDate(guestData.ExpiryDate ? guestData.ExpiryDate.split('T')[0] : '');
    //         setPlaceOfIssue(guestData.IssueCountry || '');
    //         setDocumentImage(guestData.DocumentImageBase64 || null);
    //         setFaceImage(guestData.FaceImageBase64 || null);
    //         setDocumentImage2(guestData.DocumentImageBase64 || null);
    //         // setPhoneNumber(guestData.PhoneNumber || '');
    //         // setEmail(guestData.Email || '');
    //         setAddress(guestData.Address || '');
    //         setReservationNumber(guestData.ReservationNumber || reservationNumber);
    //         setSalutation(guestData.Saturated || '');
    //     } else if (reservationNumber) {
    //         setReservationNumber(reservationNumber);
    //     }
    // }, [guestData, reservationNumber]);

    useEffect(() => {
        const fetchData = async () => {
            if (guestData) {
                setPmsProfileId(guestData.PmsProfileID || '');
                if (guestData.BirthDate == "0001-01-01") {
                    setDateOfBirth('');
                }
                else {
                    setDateOfBirth(guestData?.BirthDate || '');
                }
                setGender(guestData.Gender || '');
                setAddress(guestData.Address || '');
                setReservationNumber(reservationData?.ReservationNumber || '');
                setSalutation(guestData.Saturated || '');
            } else if (reservationNumber) {
                setReservationNumber(reservationNumber);
            }
          
        };

       fetchData();
        if (reservationData && guestData && guestData.PmsProfileID) {
             fetchProfileDocuments(guestData.PmsProfileID, reservationId);
            

             // setDateOfBirth(reservationData?.BirthDate || '');
             // setGender(reservationData?.gender || '');

             fetchCheckInCheckOutInfo(reservationData.ReservationNameID, guestData.PmsProfileID);
         }
    }, [guestData, reservationNumber, reservationData, nationalityMapping]);





    useEffect(() => {
        fetchNationalityList().then(data => {
            setNationalityList(data);
            const mapping = {};
            data.forEach(country => {
                mapping[country.CountryCode] = country.CountryName;
            });
            setNationalityMapping(mapping);
        }).catch(error => {
            console.error('Failed to fetch nationality list:', error);
        });
    }, []);


    useEffect(() => {
        fetchDocumentTypeList();
    }, []); // Empty dependency array means this effect runs once on mount



    nationalityList.forEach(country => {
        nationalityMapping[country.CountryName] = country.CountryCode;
    });

    const fullName = `${givenName} ${middleName ? middleName + ' ' : ''}${familyName}`;

    const determineGender = (genderValue) => {
        if (genderValue === 'M') {
          return 'male';
        } else if (genderValue === 'F') {
          return 'female';
        } else {
          return '';
        }
      };
    if (!isVisible) return null;

    // const formatDate = (dateString) => {
    //     const date = new Date(dateString);
    //     const day = String(date.getDate()).padStart(2, '0');
    //     const month = String(date.getMonth() + 1).padStart(2, '0');
    //     const year = date.getFullYear();
    //     return `${day}-${month}-${year}`;
    // };

    // const displayDate = (dateString) => {
    //     return dateString === '0001-01-01T00:00:00' ? 'dd-mm-yyyy' : formatDate(dateString);
    // };

    const getGuestDetails = (pmsProfileID, ReservationData) => {
        if (!ReservationData || !ReservationData.GuestProfiles) {
            console.error("reservationData or GuestProfiles is undefined");
            return null;
        }
        const guestProfiles = ReservationData?.GuestProfiles;
        const guestDetails = guestProfiles.find(profile => profile.PmsProfileID === pmsProfileID);
        return guestDetails;
    };


    const handleValidation = () => {



        const newErrors = {};
        const alphanumericRegex = /^[a-z0-9-]+$/i;
        const nameRegex = /^[a-zA-Z\s]+$/;
        const today = new Date().toISOString().split('T')[0];
        if(!documentType)
        {
            newErrors.documentType = 'Document Type is Required';
        }
        if(!documentNumber)
        {
            newErrors.documentNumber = 'Document Number is Required';
        }
        else
        if (!alphanumericRegex.test(documentNumber)) {
            newErrors.documentNumber = 'Document number should be alphanumeric';
        }

      /*  if(!dateOfBirth)
        {
            newErrors.dateOfBirth = 'DateOfBirth is Required';
        }
        else */
        if (dateOfBirth && dateOfBirth >= today) {
                newErrors.dateOfBirth = 'Date of birth cannot be today or in the future';
            }
        
        if(!givenName)
        {
            newErrors.givenName = 'GivenName is Required';
        }
        else 
        if (!nameRegex.test(givenName)) {
            newErrors.givenName = 'Given name should only contain letters';
        }
       /* if(!middleName)
        {
            newErrors.middleName = 'middleName is Required';
        }
       else if (middleName && !nameRegex.test(middleName)) {
            newErrors.middleName = 'Middle name should only contain letters';
        }*/


        // if(!gender)
        // {
        //     newErrors.gender = 'Gender is Required';
        // }
        /*if(!issueDate)
        {
            newErrors.issueDate = 'Issue Date is Required';
        }
      else*/
      if (issueDate && issueDate > today) {
        newErrors.issueDate = 'Issue date cannot be in the future';
    }
        /*if(!expiryDate)
        {
            newErrors.expiryDate = 'Expiry Date is Required';
        }
        else*/
        if (expiryDate && expiryDate < today) {
            newErrors.expiryDate = 'Expiry date should not be a past date';
        }
      
        if(!documentImage)
        {
            newErrors.documentImage = 'Document Image is Required';
        }
       
        if(documentType && documentType=='IDENTITYCARD')
        {
            if(!documentImage2)
            {
                newErrors.documentImage2 = 'Document Image2 is Required';
            }
        }

        if(!familyName)
        {
            newErrors.familyName = 'FamilyName is Required';
        }
       else
        if (!nameRegex.test(familyName)) {
            newErrors.familyName = 'Family name should only contain letters';
        }

        

           
    if (!documentType) {
        errors.documentType = "Document type is required.";
    }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getDocumentTypeById = (doccode) => {
        const documentType = documentTypeList.find(doc=>doc.DocumentCode.trim().toLowerCase() === doccode.trim().toLowerCase());
        
        return documentType.OperaDocumentCode;
    };
    const handleSave = async () => {
        setLoading(true);
        const settings = getConfig();
        console.log('Document Type:', documentType);
        if (!handleValidation()) {
            console.log("Form is invalid. Please correct the errors and try again.");
            setLoading(false);
            return;
        }

        const requestBody2 = {
            "hotelDomain": settings.hotelDomain,
            "kioskID": settings.kioskId,
            "username": settings.username,
            "password": settings.password,
            "systemType": settings.systemType,
            "language": settings.language,
            "legNumber": settings.legNumber,
            "chainCode": settings.chainCode,
            "destinationEntityID": settings.destinationEntityID,
            "destinationSystemType": settings.destinationSystemType,
            "CreateAccompanyingProfileRequest": {
                "ReservationNumber": reservationNumberState,
                "Gender": gender,
                "FirstName": givenName,
                "MiddleName": middleName,
                "LastName": familyName,
                "DocumentType": documentType,
            }
        };

        try {
            const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
            const apiUrl1 = settings.DotsURL+'/api/local/PushReservationDetails';
            const apiUrl2 = settings.DotsURL+'/api/ows/CreateAccompanyingGuset';

            let response = {};
            let response2 = {};
            let updatedReservationData = reservationData;


            if (!pmsProfileId) {

                response2 = await axios.post(apiUrl2, requestBody2, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('create new accompany api save successful:', response2.data);
                const updatedReservation = await fetchReservationData(reservationId);
                updatedReservationData = updatedReservation.responseData[0];

                setReservationData(updatedReservationData);
                console.log('Updated reservation data:', updatedReservationData);

            }
            var guestDetails;
            var newPmsProfileId;
            if (response2.data && response2.data.result) {
                const responseData = response2.data?.responseData;
                newPmsProfileId = responseData.PmsProfileID;
                setPmsProfileId(newPmsProfileId);
                console.log('Response Data:', responseData);

            }
            else {
                newPmsProfileId = guestData.PmsProfileID;
                setPmsProfileId(guestData.PmsProfileID);
            }
            // else {
            //     console.error('Failed to get PmsProfileID from response');
            // }
            if (newPmsProfileId && newPmsProfileId != null) {
                guestDetails = await getGuestDetails(newPmsProfileId, updatedReservationData);
            }
            else {
                guestDetails = await getGuestDetails(pmsProfileId, updatedReservationData);

            }

            const requestBody1 = {
                "RequestObject": [
                    {
                        "ConfirmationNumber": reservationData?.ConfirmationNumber ?? '',
                        "ReservationNumber": reservationNumberState,
                        "ReservationNameID": reservationData?.ReservationNameID,
                        "ArrivalDate": reservationData?.ArrivalDate,
                        "DepartureDate": reservationData?.DepartureDate,
                        "CreatedDateTime": reservationData?.CreatedDateTime,
                        "Adults": adults??reservationData?.Adults??1,
                        "Child": reservationData?.Child,
                        "ReservationStatus": reservationData?.ReservationStatus,
                        "ComputedReservationStatus": reservationData?.ComputedReservationStatus,
                        "LegNumber": reservationData?.LegNumber,
                        "ChainCode": reservationData?.ChainCode,
                        "ExpectedDepartureTime": reservationData?.ExpectedDepartureTime,
                        "ExpectedArrivalTime": reservationData?.ExpectedArrivalTime,
                        "ReservationSourceCode": reservationData?.ReservationSourceCode,
                        "ReservationType": reservationData?.ReservationType,
                        "PrintRate": reservationData?.PrintRate,
                        "NoPost": reservationData?.NoPost,
                        "DoNotMoveRoom": reservationData?.DoNotMoveRoom,
                        "TotalAmount": reservationData?.TotalAmount,
                        "TotalTax": reservationData?.TotalTax,
                        "IsTaxInclusive": reservationData?.IsTaxInclusive,
                        "CurrentBalance": reservationData?.CurrentBalance,
                        "RoomDetails": {
                            "RoomNumber": editroomNumber ?? reservationData?.RoomDetails?.RoomNumber ?? 0,
                            "RoomType": reservationData?.RoomDetails?.RoomType,
                            "RoomTypeDescription": reservationData?.RoomDetails?.RoomTypeDescription,
                            "RoomTypeShortDescription": reservationData?.RoomDetails?.RoomTypeShortDescription,
                            "RoomStatus": reservationData?.RoomDetails?.RoomStatus,
                            "RTC": reservationData?.RoomDetails?.RTC,
                            "RTCDescription": reservationData?.RoomDetails?.RTCDescription,
                            "RTCShortDescription": reservationData?.RoomDetails?.RTCShortDescription
                        },
                        "RateDetails": {
                            "RateCode": reservationData?.RateDetails?.RateCode,
                            "RateAmount": reservationData?.RateDetails?.RateAmount,
                            "DailyRates": reservationData?.RateDetails?.DailyRates,
                            "IsMultipleRate": reservationData?.RateDetails?.IsMultipleRate
                        },
                        "PartyCode": reservationData?.PartyCode,
                        "PaymentMethod": reservationData?.PaymentMethod,
                        "IsPrimary": reservationData?.IsPrimary,
                        "ETA": reservationData?.ETA,
                        "FlightNo": reservationData?.FlightNo,
                        "IsCardDetailPresent": reservationData?.IsCardDetailPresent,
                        "IsDepositAvailable": reservationData?.IsDepositAvailable,
                        "IsPreCheckedInPMS": reservationData?.IsPreCheckedInPMS,
                        "IsSaavyPaid": reservationData?.IsSaavyPaid,
                        "SharerReservations": reservationData?.SharerReservations,
                        "DepositDetail": reservationData?.DepositDetail,
                        "PreferanceDetails": reservationData?.PreferanceDetails,
                        "PackageDetails": reservationData?.PackageDetails,
                        "userDefinedFields": reservationData?.userDefinedFields,
                        "GuestProfiles": [
                            {
                                "PmsProfileID": guestDetails.PmsProfileID,
                                "FamilyName": familyName,
                                "GivenName": givenName,
                                "GuestName": `${givenName} ${familyName}`,
                                "Nationality": nationality,
                                "Gender": gender,
                                "PassportNumber": documentNumber,
                                "DocumentType": documentType,
                                "IsPrimary": guestDetails?.IsPrimary || false,
                                "MembershipType": guestDetails?.MembershipType || null,
                                "MembershipNumber": guestDetails?.MembershipNumber || null,
                                "MembershipID": guestDetails?.MembershipID || null,
                                "MembershipName": guestDetails?.MembershipName || null,
                                "MembershipClass": guestDetails?.MembershipClass || null,
                                "MembershipLevel": guestDetails?.MembershipLevel || null,
                                "FirstName": givenName,
                                "MiddleName": middleName,
                                "LastName": familyName,
                                "Phones": reservationData?.Phones,
                                "Address": reservationData?.Address,
                                "Email": reservationData?.Email,
                                "BirthDate": dateOfBirth,
                                "IssueDate": issueDate,
                                "IssueCountry": placeOfIssue,
                                "IsActive": reservationData?.IsActive,
                                "Title": reservationData?.Title,
                                "VipCode": reservationData?.VipCode,
                                "CloudProfileDetailID": null
                            }
                        ],
                        "Alerts": reservationData?.Alerts,
                        "IsMemberShipEnrolled": reservationData?.IsMemberShipEnrolled,
                        "reservationDocument": reservationData?.reservationDocument,
                        "GuestSignature": reservationData?.GuestSignature,
                        "FolioEmail": reservationData?.FolioEmail || '',
                        "IsBreakFastAvailable": reservationData?.IsBreakFastAvailable
                    }
                ],
                "SyncFromCloud": true
            };

            response = await axios.post(apiUrl1, requestBody1, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('First save successful:', response.data);
            if (response.data && response.data.result) {
                const responseData = response.data.responseData;
                console.log('Response Data:', responseData);
               
            } else {
                console.error('Save failed:', response.data);
            }

            await updatePassportDetails(guestDetails);
            await pushDocumentDetails(guestDetails);
            //  await handleUpdateAddress(guestDetails);
            await handleUpdateName(guestDetails);
    if(guestDetails  && !isCheckIn && (reservationData.ReservationStatus === 'RESERVED' || reservationData.ReservationStatus === 'DUEIN' || reservationData.ReservationStatus === 'INHOUSE'))
    {
        await handleCheckInCheckOut(reservationData.ReservationNameID, guestDetails.PmsProfileID, 1, null)
    }
    if(guestDetails  && !isCheckOut && (reservationData.ReservationStatus === 'DUEOUT'))
        {
          await handleCheckInCheckOut(reservationData.ReservationNameID, guestDetails.PmsProfileID, null, 1)
        }
        setisVisibleSave(false);
           await onSave(); 
           setLoading(false);
           toast.success('Save action successful!', {
        position: "top-center"
      });
           // setShowSuccessAlert(true);
          // toast.success('Save action successful!');
           // setTimeout(() => setShowSuccessAlert(false), 3000);
            
           // window.location.reload();
            // await handleUpdateEmail();
            // await handleUpdatePhone();
            // await handleUpdateAddress();


        } catch (error) {
            setLoading(false);
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to save guest details:', error);
        }
    };

    const handleCancel = () => {
        onCancel();
        console.log('Cancel editing guest details...');
    };

    const updatePassportDetails = async (guestDetails) => {
        try {

            if (!guestDetails) {
                throw new Error('Guest details not found');
            }

            const phoneDetails = guestDetails.Phones && guestDetails.Phones.length > 0 ? guestDetails.Phones[0] : {};
            const emailDetails = guestDetails.Email && guestDetails.Email.length > 0 ? guestDetails.Email[0] : {};
            const addressDetails = guestDetails.Address && guestDetails.Address.length > 0 ? guestDetails.Address[0] : {};
            const config = getConfig();
            const requestBody = {
                hotelDomain: config.hotelDomain,
                kioskID: config.kioskId,
                username: config.username,
                password: config.password,
                systemType: config.systemType,
                language: config.language,
                legNumber: config.legNumber,
                chainCode: config.chainCode,
                destinationEntityID: config.destinationEntityID,
                destinationSystemType: config.destinationSystemType,
                UpdateProileRequest: {
                    addresses: null,
                    profileID: guestDetails.PmsProfileID,
                    emails: null,
                    phones: null,
                    dob: dateOfBirth || '',
                    gender: gender || '',
                    nationality: nationality || '',
                    issueCountry: placeOfIssue || '',
                    documentNumber: documentNumber || '',
                    documentType: getDocumentTypeById(documentType),
                    issueDate: issueDate || '',
                    expiryDate: expiryDate || ''
                }
            };

            console.log(requestBody);
            const apiUrl = config.DotsURL+'/api/ows/UpdatePassport';

            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Update passport details successful:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to update passport details:', error);
        }
    };


    const handleScan = async (scanType) => {
        setLoading(true);
        const config = getConfig();
        const scanDuration = 3000;
                try {
           await new Promise((resolve) => setTimeout(resolve, scanDuration));
            const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
          /*  const response = await fetch(`${settings.scanningURL}/api/IDScan/ScanDocument`, {
                method: 'GET',
            headers: {
                'Content-Type': 'application/json',
               
            },
           
            });*/
            const response = await axios.get(config.scanningURL+'/api/IDScan/ScanDocument', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors' // Ensure CORS mode is explicitly set
                });
            if (response.status !== 200) {
                setLoading(false);
                throw new Error(`HTTP error! status: ${response.status}`);
              }
           

            const data = await response.data;
            if (data.Result) {
                const scannedData = data.ScannedDocument;
                const nationalityCode = nationalityMapping[scannedData.NationalityFullName] || '';

                if (scanType === 'front') {
                    if (!documentImage) {
                        //setDocumentType(data.documentType);
                        if (!documentType || scannedData.DocumentType) {
                          
                        setDocumentType(scannedData.DocumentType || '');
                        }
                        if (!nationality || nationalityCode) {
                        setNationality(nationalityCode);
                        }
                        if (!documentNumber || scannedData.DocumentNumber) {
                        setDocumentNumber(scannedData.DocumentNumber || '');
                        }
                        if (!dateOfBirth || scannedData.DateOfBirth) {
                        setDateOfBirth(scannedData.DateOfBirth ? scannedData.DateOfBirth.split('T')[0] : '');
                        }
                        if (!givenName || scannedData.GivenName) {
                        setGivenName(scannedData.GivenName || '');
                        }
                        if (!middleName || scannedData.MiddleName) {
                        setMiddleName(scannedData.MiddleName || '');
                        }
                        if (!gender || scannedData.Gender) {
                        setGender(determineGender(scannedData.Gender) || '');
                        }
                        if (!familyName || scannedData.LastName) {
                        setFamilyName(scannedData.LastName || '');
                        }
                        if (!issueDate || scannedData.IssueDate) {
                        setIssueDate(scannedData.IssueDate ? scannedData.IssueDate.split('T')[0] : '');
                        }
                        if (!expiryDate || scannedData.ExpiryDate) {
                        setExpiryDate(scannedData.ExpiryDate ? scannedData.ExpiryDate.split('T')[0] : '');
                        }
                        if (!placeOfIssue || scannedData.IssuingPlace) {
                        setPlaceOfIssue(scannedData.IssuingPlace || '');
                        }
                        if (!documentImage || scannedData.DocumentImageBase64) {
                        setDocumentImage(scannedData.DocumentImageBase64 || null);
                        }
                        if (!faceImage || scannedData.FaceImageBase64) {
                            setFaceImage(scannedData.FaceImageBase64 || null);
                            }
                       
                    }
                    setBackScanButtonClicked(false);
                } else if (scanType === 'back') {
                    if (!documentImage2 ) {
                        //setDocumentType(scannedData.documentType);
                        if (!documentType)
                        {
                        setDocumentType(scannedData.DocumentType || '');
                        }
                    if (!nationality) {
                        setNationality(nationalityCode);
                    }
                    if (!documentNumber) {
                        setDocumentNumber(scannedData.DocumentNumber || '');
                    }
                    if(!dateOfBirth)
                    {
                        setDateOfBirth(scannedData.DateOfBirth ? scannedData.DateOfBirth.split('T')[0] : '');
                    }
                    if(!givenName)
                    {
                        setGivenName(scannedData.GivenName || '');
                    }
                    if(!middleName)
                    {
                        setMiddleName(scannedData.MiddleName || '');
                    }
                    if(!gender)
                    {
                        setGender(determineGender(scannedData.Gender) || '');
                    }
                    if(!familyName)
                    {
                        setFamilyName(scannedData.LastName || '');
                    }
                    if(!issueDate)
                    {
                        setIssueDate(scannedData.IssueDate ? scannedData.IssueDate.split('T')[0] : '');
                    }
                    if(!expiryDate)
                    {
                        setExpiryDate(scannedData.ExpiryDate ? scannedData.ExpiryDate.split('T')[0] : '');
                    }
                    if(!placeOfIssue)
                    {  
                        setPlaceOfIssue(scannedData.IssuingPlace || '');
                    }
                    if(!documentImage2)
                    {
                        setDocumentImage2(scannedData.DocumentImageBase64 || null);
                    }
                    if(!faceImage)
                    {
                        setFaceImage(scannedData.FaceImageBase64 || null);
                    }
                    setBackScanButtonClicked(true);
                }
            } else {
                console.error("Scanning failed:", data.ErrorMessage);
            }
        }
        } catch (error) {
            console.error("Failed to scan document:", error);
            setAreButtonsVisible(false);
        }
        setLoading(false);
    };
 
    const pushDocumentDetails = async(guestDetails) => {
        const config = getConfig();
        const requestBody = {
            RequestObject: [
                {
                    ReservationNameID: reservationData.ReservationNameID,
                    ProfileID: guestDetails.PmsProfileID,
                    DocumentNumber: documentNumber,
                    ExpiryDate: expiryDate,
                    IssueDate: issueDate,
                    DocumentImage1: documentImage,
                    DocumentImage2: documentImage2,
                    DocumentImage3: null,
                    FaceImage: faceImage,
                    CloudProfileDetailID: "",
                    DocumentTypeCode: getDocumentTypeById(documentType),
                    //Documenttype:documentType,

                    IssueCountry: placeOfIssue
                }
            ],
            SyncFromCloud: null
        };

        fetch(config.DotsURL+'/api/local/PushDocumentDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                setAreButtonsVisible(true);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };




   



    const fetchNationalityList = async () => {
        const settings = getConfig();
        try {
            const response = await fetch(settings.DotsURL+'/api/ows/GetNationalityList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hotelDomain: settings.hotelDomain,
                    kioskID: settings.kioskId,
                    username: settings.username,
                    password: settings.password,
                    systemType: settings.systemType,
                    language: settings.language,
                    legNumber: null,
                    chainCode: settings.chainCode,
                    destinationEntityID: settings.destinationEntityID,
                    destinationSystemType: settings.destinationSystemType,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.responseData;
        } catch (error) {
            console.error("Failed to fetch nationality list:", error);
            return [];
        }
    };

    const fetchDocumentTypeList = async () => {
        try {
            const settings = getConfig();
            const response = await fetch(settings.DotsURL + '/api/local/FetchDocumentTypeMaster', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setDocumentTypeList(data.responseData);
        } catch (error) {
            console.error("Failed to fetch document type list:", error);
            setDocumentTypeList([]);
        }
    };

    
    
    const handleUpdateName = async (guestDetails) => {
        const settings = getConfig();
        const requestBody = {
            hotelDomain: settings.hotelDomain,
            kioskID: settings.kioskId,
            username: settings.username,
            password: settings.password,
            systemType: settings.systemType,
            language: settings.language,
            legNumber: settings.legNumber,
            chainCode: settings.chainCode,
            destinationEntityID: settings.destinationEntityID,
            destinationSystemType: settings.destinationSystemType,
            UpdateProileRequest: {
                addresses: null,
                profileID: guestDetails.PmsProfileID,
                emails: null,
                phones: null,
                dob: dateOfBirth || '',
                gender: gender || '',
                nationality: nationality || '',
                issueCountry: placeOfIssue || '',
                documentNumber: documentNumber || '',
                documentType: documentType || '',
                issueDate: issueDate || '',
                expiryDate: expiryDate || ''
            }
        };
        console.log(requestBody);

        try {
            const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
            const apiUrl = settings.DotsURL+'/api/ows/UpdateName';

            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Update name successful:', response.data);
            } catch (error) {
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to update name details:', error);
            }
    };
    
    const handleUpdatePhone = async () => {
        try {
            const settings = getConfig();
            var guestDetails = await getGuestDetails(pmsProfileId);
            if (!guestDetails) {
                throw new Error('Guest details not found');
            }
            
            const phoneDetails = guestDetails.Phones ? guestDetails.Phones[0] : {};
            
            const requestBody = {
                hotelDomain: settings.hotelDomain,
                kioskID: settings.kioskId,
                username: settings.username,
                password: settings.password,
                systemType: settings.systemType,
                language: settings.language,
                legNumber: settings.legNumber,
                chainCode: settings.chainCode,
                destinationEntityID: settings.destinationEntityID,
                destinationSystemType: settings.destinationSystemType,
                UpdateProileRequest: {
                    addresses: null,
                    profileID: pmsProfileId,
                    emails: null,
                    phones: null,
                    dob: guestDetails.BirthDate || '',
                    gender: guestDetails.Gender || '',
                    nationality: guestDetails.Nationality || '',
                    issueCountry: guestDetails.issueCountry || '',
                    documentNumber: guestDetails.PassportNumber || '',
                    documentType: guestDetails.DocumentType || '',
                    issueDate: guestDetails.IssueDate || ''
                }
            };
            
            console.log(requestBody);
            const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
            const apiUrl = settings.DotsURL+'/api/ows/UpdatePhoneList';
            
            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                    }
            });
            console.log('Update phone list successful:', response.data);
            } catch (error) {
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
                } else if (error.request) {
                    console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to update phone list:', error);
        }
        };
        
    const handleUpdateEmail = async () => {
        const settings = getConfig();
        let guestDetails = getGuestDetails(pmsProfileId);
        const requestBody = {
            hotelDomain: settings.hotelDomain,
            kioskID: settings.kioskId,
            username: settings.username,
            password: settings.password,
            systemType: settings.systemType,
            language: settings.language,
            legNumber: settings.legNumber,
            chainCode: settings.chainCode,
            destinationEntityID: settings.destinationEntityID,
            destinationSystemType: settings.destinationSystemType,
            UpdateProileRequest: {
                addresses: null,
                profileID: pmsProfileId,
                emails: [
                    {
                        emailType: reservationData?.GemailType,
                        operaId: reservationData?.operaId,
                        primary: reservationData?.primary,
                        displaySequence: reservationData?.displaySequence,
                        // email: email
                        }
                ],
                phones: null,
                dob: reservationData?.dob,
                gender: reservationData?.gender,
                nationality: reservationData?.nationality,
                issueCountry: reservationData?.issueCountry,
                documentNumber: reservationData?.documentNumber,
                documentType: reservationData?.documentType,
                issueDate: reservationData?.issueDate
                }
                };
                
                try {
                    const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
                    const apiUrl = settings.DotsURL+'/api/ows/UpdateEmailList';
                    
            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Update email list successful:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
                } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to update email list:', error);
        }
        };

        const handleUpdateAddress = async () => {
            const settings = getConfig();
        const requestBody = {
            hotelDomain: settings.hotelDomain,
            kioskID: settings.kioskId,
            username: settings.username,
            password: settings.password,
            systemType: settings.systemType,
            language: settings.language,
            legNumber: settings.legNumber,
            chainCode: settings.chainCode,
            destinationEntityID: settings.destinationEntityID,
            destinationSystemType: settings.destinationSystemType,
            UpdateProileRequest: {
                addresses: [
                    {
                        addressType: reservationData?.GuestProfiles?.GuestProfiles[0].addresses[0].addressType,
                        operaId: reservationData?.GuestProfiles[0].addresses[0].operaId,
                        primary: reservationData?.GuestProfiles[0].addresses[0].primary,
                        displaySequence: reservationData?.GuestProfiles[0].addresses[0].displaySequence,
                        address1: reservationData?.GuestProfiles[0].addresses[0].address1,
                        address2: reservationData?.GuestProfiles[0].addresses[0].address2,
                        city: reservationData?.GuestProfiles[0].addresses[0].city,
                        state: reservationData?.GuestProfiles[0].addresses[0].state,
                        country: reservationData?.GuestProfiles[0].addresses[0].country,
                        zip: reservationData?.GuestProfiles[0].addresses[0].zip
                        }
                        ],
                        profileID: pmsProfileId,
                        emails: null,
                        phones: null,
                        dob: null,
                        gender: null,
                        nationality: null,
                        issueCountry: null,
                        documentNumber: null,
                documentType: null,
                issueDate: null
            }
        };
        
        try {
            const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
            const apiUrl = settings.DotsURL+'/api/ows/UpdateAddressList';

            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
                });
            console.log('Update address list successful:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Server responded with non-2xx status:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up the request:', error.message);
            }
            console.error('Failed to update address list:', error);
        }
    };

    const fetchCheckInCheckOutInfo = async (reservationNameID, profileID) => {
        try {
            const settings = getConfig();
            const apiUrl = settings.DotsURL+'/api/local/FetchProfileInformationProfileId';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "RequestObject": {
                        "ReservationNameID": reservationNameID,
                        "ProfileID": profileID
                    },
                    "SyncFromCloud": null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched check-in/check-out info:", data);

            if (data && data.responseData && data.responseData.length > 0) {
                const checkInCheckOutInfo = data.responseData[0];
                setIsCheckIn(checkInCheckOutInfo.IsCheckIn);
                setIsCheckOut(checkInCheckOutInfo.IsCheckOut);
            }
        } catch (error) {
            console.error("Failed to fetch check-in/check-out info:", error);
        }
    };
    const fetchProfileDocuments = async (pmsProfileId, reservationNameID) => {
        try {
            const settings = getConfig();
            const fetchprofileUrl = settings.DotsURL+'/api/local/FetchProfileDocumentImageByProfileID';
       
            const apiUrl = settings.DotsURL+'/api/local/FetchProfileDocumentImageByProfileID';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "RequestObject": {
                        "ReservationNameID": reservationNameID,
                        "ProfileID": pmsProfileId
                    },
                    "SyncFromCloud": null
                })
            });

          

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            if (typeof data === 'string') {
                console.error('Error page HTML:', data);
                return null;
            }

            if (data && data.responseData && data.responseData.length > 0) {         
                const profileData = data.responseData[0];                                            
                setDocumentType(profileData?.DocumentType || '');
                   // setNationality(nationalityMapping[profileData?.Nationality] || profileData?.Nationality || '');
               setNationality(profileData?.Nationality||'');
           
                setDocumentNumber(profileData?.DocumentNumber || '');
                setIssueDate(profileData?.IssueDate ? profileData.IssueDate.split('T')[0] : '');
                setExpiryDate(profileData?.ExpiryDate ? profileData.ExpiryDate.split('T')[0] : '');
                setPlaceOfIssue(profileData?.IssueCountry || '');
                setDocumentImage(profileData?.DocumentImage1 || null);
                setDocumentImage2(profileData?.DocumentImage2 || null);
                
                setFaceImage(profileData?.FaceImage || null);
                setGivenName(profileData?.FirstName || '');
                setMiddleName(profileData?.MiddleName || '');
                setFamilyName(profileData?.LastName || '');
                if(profileData?.DocumentImage1)
                {
                    setisVisibleSave(false);
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };
    const handleCheckInCheckOut = async (reservationNameID, profileID, checkIn, checkOut) => {
       setLoading(true);
        try {
            const settings = getConfig();
            const apiUrl = settings.DotsURL+'/api/local/UpdateGuestReserveStatus';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "RequestObject": {
                        "ReservationNameID": reservationNameID,
                        "ProfileID": profileID,
                        "Checkin": checkIn,
                        "Checkout": checkOut
                    },
                    "SyncFromCloud": null
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`${checkIn ? "Check-in" : "Check-out"} successful:`, data);

            // Fetch the updated status to reflect the changes
            fetchCheckInCheckOutInfo(reservationNameID, profileID);
           // toast.success('Saved successfully!');
        } catch (error) {
            toast.error('Guest Check-In Error!');
            console.error(`Failed to ${checkIn ? "check in" : "check out"}:`, error);
        }
        setLoading(false);
    };

return (
    
    <div className="guest-details-container">
        {loading && (
            <div className="loading-overlay">
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            </div>
        )}
        {showSuccessAlert && (
            <Alert variant="filled" severity="success" onClose={() => setShowSuccessAlert(false)}>
                A new Guest added Successfully.
            </Alert>
        )}
        {!loading && !showSuccessAlert && (
            <>
            <div className='notification-container'> <div className="notification-icon">&#33;</div><div className="notification-message">Please place the document on scanner and scan on Picture Box</div></div>
                <div className="guest-images">
                    <div className={`documentImage ${errors.documentImage ? 'has-error' : ''}`}>
                    <div className="user-pic">
                        {documentImage ? (
                            <img src={`data:image/png;base64, ${documentImage}`} alt="Document Image" className="full-img" />
                        ) : (
                            <div className="empty-placeholder">Scan Document Image1</div>
                        )}
                        <button onClick={() => handleScan('front')} className='scan-button'>
                            <i className="bi bi-upc-scan"></i>Scan
                        </button>
                    </div>
                    {errors.documentImage && <div className="error">{errors.documentImage}</div>}
                    </div>
                    <div className={`documentImage2 ${errors.documentImage2 ? 'has-error' : ''}`}>
                    <div className="user-pic">
                        {documentImage2 || backScanButtonClicked ? (
                            <img src={`data:image/png;base64, ${documentImage2}`} alt="Document Image" className="full-img" />
                        ) : (
                            <div className="empty-placeholder">Scan  Document Image 2 </div>
                        )}
                        <button onClick={() => handleScan('back')} className='scan-button'>
                            <i className="bi bi-upc-scan"></i>Scan
                        </button>
                    </div>
                    {errors.documentImage2 && <div className="error">{errors.documentImage2}</div>}
                    </div>
                    <div className="profile-pic">
                        {faceImage ? (
                            <img src={`data:image/png;base64, ${faceImage}`} alt="Face Image" className="face-img" />
                        ) : (
                            <div className="empty-placeholder">profile picture Not available</div>
                        )}
                      
                    </div>
                    {/* {documentImage && (
                        <div className='add-guest-button-container'>
                            { guestData  && !isCheckIn && (reservationData.ReservationStatus === 'RESERVED' || reservationData.ReservationStatus === 'DUEIN' || reservationData.ReservationStatus === 'INHOUSE') && (
                                <button type="button" className="btn btn-outline-primary out-btn" onClick={() => handleCheckInCheckOut(reservationData.ReservationNameID, guestData.PmsProfileID, 1, null)}>
                                    Check In
                                    <i className="bi bi-check-square"></i>
                                </button>
                            )}
                            {guestData  && !isCheckOut && (reservationData.ReservationStatus === 'DUEOUT') && (
                                <button type="button" className="btn btn-outline-primary in-btn" onClick={() => handleCheckInCheckOut(reservationData.ReservationNameID, guestData.PmsProfileID, null, 1)}>
                                    Check Out
                                    <i className="bi bi-x-square"></i>
                                </button>
                            )}
                            {IsAddGuestvisible &&
                                <button type="button" className={`btn btn-outline-primary ${isButtonClicked ? 'clicked' : ''}`} onClick={addGuest}>
                                    Add Guest
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                            }
                        </div>
                    )} */}
                </div>
                <div className="guest-form">
                    <div className={`document-type ${errors.documentType ? 'has-error' : ''}`}>
                        <label>Document Type</label>
                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                            <option value="">Select Document Type</option>
                            <option value="PASSPORT">Passport</option>
                            <option value="IDENTITYCARD">Id Card</option>
                            <option value="RESIDENTPERMIT">Resident Permit</option>
                            <option value="DRIVINGLICENSE">Driving License</option>
                            <option value="UNKNOWN">Uknown</option>
                            <option value="VISA">Visa</option>
                        </select>
                        {errors.documentType && <div className="error">{errors.documentType}</div>}
                    </div>


                    
                    <div className={`document-number ${errors.documentNumber ? 'has-error' : ''}`}>
                        <label>Document Number</label>
                        <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                        {errors.documentNumber && <div className="error">{errors.documentNumber}</div>}
                    </div>
                    <div className={`nationality ${errors.nationality ? 'has-error' : ''}`}>
                        <label>Nationality</label>
                        <select value={nationality} onChange={(e) => setNationality(e.target.value)}>
                            <option value="">Select Nationality</option>
                            {nationalityList.map(country => (
                                <option key={country.CountryCode} value={country.CountryCode}>
                                    {country.CountryName}
                                </option>
                            ))}
                        </select>
                        {errors.nationality && <div className="error">{errors.nationality}</div>}
                    </div>
                    <div className={`date-of-birth ${errors.dateOfBirth ? 'has-error' : ''}`}>
                        <label>Date of Birth</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                        {errors.dateOfBirth && <div className="error">{errors.dateOfBirth}</div>}
                    </div>
                    <div className={`given-name ${errors.givenName ? 'has-error' : ''}`}>
                        <label>Given Name</label>
                        <input type="text" value={givenName} onChange={(e) => setGivenName(e.target.value)} />
                        {errors.givenName && <div className="error">{errors.givenName}</div>}
                    </div>
                    {middleName && (
                        <div className={`middle-name ${errors.middleName ? 'has-error' : ''}`}>
                            <label>Middle Name</label>
                            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                            {errors.middleName && <div className="error">{errors.middleName}</div>}
                        </div>
                    )}
                    <div className={`family-name ${errors.familyName ? 'has-error' : ''}`}>
                        <label>Family Name</label>
                        <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
                        {errors.familyName && <div className="error">{errors.familyName}</div>}
                    </div>
                    <div className="full-name">
                        <label>Full Name</label>
                        <input type="text" value={fullName} readOnly />
                    </div>
                    <div className={`gender ${errors.gender ? 'has-error' : ''}`}>
                        <label>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {errors.gender && <div className="error">{errors.gender}</div>}
                    </div>
                    <div className={`issue-date ${errors.issueDate ? 'has-error' : ''}`}>
                        <label>Issue Date</label>
                        <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                        {errors.issueDate && <div className="error">{errors.issueDate}</div>}
                    </div>
                    <div className={`expiry-date ${errors.expiryDate ? 'has-error' : ''}`}>
                        <label>Expiry Date</label>
                        <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        {errors.expiryDate && <div className="error">{errors.expiryDate}</div>}
                    </div>
                    <div className="place-of-issue">
                        <label>Place of Issue</label>
                        <input type="text" value={placeOfIssue} onChange={(e) => setPlaceOfIssue(e.target.value)} />
                    </div>
                </div>
                <div className="form-buttons">
                    {isVisibleSave &&
                    <button onClick={handleSave}>
                        <i className="bi bi-floppy"></i>Save
                    </button>
}
                    <button onClick={handleCancel}>
                        <i className="bi bi-x-square"></i>Cancel
                    </button>
                </div>
            </>
        )}
    </div>
);


};


export default GuestDetails;
