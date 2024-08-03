import React, { useState, useEffect, useRef,useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Ensure correct import
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../Images/logo.png';
import ID_GO from '../../Images/ID-GO.png';
import './Home.css';
import GuestDetails from '../GuestDetails/GuestDetails';
import settings from '../../app.settings';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NotFound from '../NotFound/NotFound';
import { getConfig } from '../../config';
const fetchWithRetry = async (fetchFunction, params, retries = 1) => {
    try {
        const response = await fetchFunction(params);
       
        if (!response || response.responseData.length === 0) {
            throw new Error('Invalid response data');
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            return await fetchWithRetry(fetchFunction, params, retries - 1);
        } else {
            toast.error('Failed to fetch reservation data after multiple attempts.');
            throw error;
        }
    }
};

const fetchReservationData = async (reservationId) => {
   const config = getConfig();
   console.log('Settings:', config); // Debugging
    const response = await fetch(config.DotsURL+'/api/ows/FetchReservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: "cors",
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

    return await response.json();
};

const fetchReservationDataByRefNumber = async (refNumber) => {
    const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
    const config = getConfig();
    const response = await fetch(`${config.DotsURL}/api/local/FetchReservationDetailsByRefNumber`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "RequestObject": {
                "ReferenceNumber": refNumber,
                "ArrivalDate": null
            },
            "SyncFromCloud": null
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

const handlePushReservation = async (reservationData, roomNumber, adults) => {
    const reservationNumberState = reservationData?.ReservationNumber ?? '';
    const pmsProfileId = reservationData?.GuestProfiles?.[0]?.PmsProfileID ?? '';
    const familyName = reservationData?.GuestProfiles?.[0]?.FamilyName ?? '';
    const givenName = reservationData?.GuestProfiles?.[0]?.GivenName ?? '';
    const nationality = reservationData?.GuestProfiles?.[0]?.Nationality ?? '';
    const gender = reservationData?.GuestProfiles?.[0]?.Gender ?? '';
    const documentNumber = reservationData?.GuestProfiles?.[0]?.PassportNumber ?? '';
    const documentType = reservationData?.GuestProfiles?.[0]?.DocumentType ?? '';
    const guestDetails = reservationData?.GuestProfiles?.[0] ?? {};

    const requestBody1 = {
        "RequestObject": [
            {
                ...reservationData,
                "ReservationNumber": reservationNumberState,
                "Adults": adults,
                "RoomDetails": {
                    ...reservationData.RoomDetails,
                    "RoomNumber": roomNumber || '0',
                },
                "GuestProfiles": [
                    {
                        "PmsProfileID": pmsProfileId,
                        "FamilyName": familyName,
                        "GivenName": givenName,
                        "GuestName": `${givenName} ${familyName}`,
                        "Nationality": nationality,
                        "Gender": gender,
                        "PassportNumber": documentNumber,
                        "DocumentType": documentType,
                        ...guestDetails
                    }
                ]
            }
        ],
        "SyncFromCloud": true
    };

    try {
        const config = getConfig();
        const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
        const apiUrl1 = `${config.DotsURL}/api/local/PushReservationDetails`;

        const response = await axios.post(`${apiUrl1}`, requestBody1, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.data;
        console.log("Push reservation successful:", data);
    } catch (error) {
        console.error("Failed to push reservation:", error);
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
};

function Home() {
    const { reservationId } = useParams();
    const [reservationData, setReservationData] = useState(null);
    const [guests, setGuests] = useState(['Primary Guest']);
    const [visibleGuestIndex, setVisibleGuestIndex] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [isEditingRoomNumber, setIsEditingRoomNumber] = useState(false);
    const [isEditingAdults, setIsEditingAdults] = useState(false);
    const [editableRoomNumber, setEditableRoomNumber] = useState('0');
    const [editableAdults, setEditableAdults] = useState('');

    const roomNumberRef = useRef(null);
    const adultsRef = useRef(null);
    const [config, setConfig] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadConfig = async () => {
          try {
          //  await fetchConfig();
            const configData = getConfig();
            setConfig(configData);
          } catch (error) {
            setError('Failed to load configuration');
            console.error('Error loading configuration:', error);
          }
        };
    
        loadConfig();
      }, []);
    
  
    const refreshReservationData = async (refNumber) => {
        const data = await fetchReservationDataByRefNumber(refNumber);
        if (data && data.responseData && data.responseData.length > 0) {
            const reservation = data.responseData[0];
            setEditableRoomNumber(reservation.RoomNumber ?? '0');
           // setEditableAdults(reservation.Adultcount ?? '0');
        } else {
            console.error("Invalid data structure:", data);
        }
    };

    useEffect(() => {
        if (reservationId) {
            fetchWithRetry(fetchReservationData, reservationId, 1).then(data => {
                if (data && data.responseData && data.responseData.length > 0) {
                    const reservation = data.responseData[0];
                    setReservationData(reservation);
                    const guestProfiles = reservation.GuestProfiles || [];
                    setGuests(guestProfiles.map(profile => profile.GuestName || 'Guest'));
                    setEditableRoomNumber(reservation.RoomDetails?.RoomNumber ?? '0');
                    setEditableAdults(guestProfiles.length);
                    refreshReservationData(reservation?.ReservationNumber)
                } else {
                    setReservationData(null); // Mark as invalid
                }
            }).catch(error => {
                console.error("Failed to fetch reservation data:", error);
            });
        }
    }, [reservationId]);

    const addGuest = () => {
        setGuests([...guests, `Accompany ${guests.length+1}`]);
        setEditableAdults(guests.length+1);
        setIsButtonClicked(true);
    };

    const toggleGuestDetails = (index) => {
        setVisibleGuestIndex(visibleGuestIndex === index ? null : index);
        setIsExpanded(visibleGuestIndex === index ? false : true);
    };

    //const handleRoomNumberChange = (event) => {
      //  setEditableRoomNumber(event.target.value);

   // };

    const handleRoomNumberChange = (e) => {
        const value = e.target.value;
        setEditableRoomNumber(value);
       /* if (value === '') {
            setEditableRoomNumber('0');
        }*/
    };


    //const handleAdultsChange = (event) => {
       // setEditableAdults(event.target.value);
   // };
   const handleAdultsChange = (event) => {
    let value = event.target.value;
    if (value < 0) {
        value = '1'; 
    }
    setEditableAdults(value);
};

    const handleRoomNumberClick = () => {
        setIsEditingRoomNumber(true);
    };

    const handleAdultsClick = () => {
        setIsEditingAdults(true);
    };

    const handleOutsideClick = useCallback((event) => {
        if (roomNumberRef.current && !roomNumberRef.current.contains(event.target)) {
            handlePushReservation(reservationData, editableRoomNumber, editableAdults);
            setIsEditingRoomNumber(false);
             //
        }
        if (adultsRef.current && !adultsRef.current.contains(event.target)) {
            setIsEditingAdults(false);
        }
    });

    const handleKeyPress = async (event, type) => {
        if (event.key === 'Enter') {
            await handlePushReservation(reservationData, editableRoomNumber, editableAdults);
            if (type === 'roomNumber') {
                setIsEditingRoomNumber(false);
            } else if (type === 'adults') {
                setIsEditingAdults(false);
            }
        }
    };

    const handleBlurRoomNumber = () => {
        if (editableRoomNumber === '') {
            setEditableRoomNumber('');
        }
    };

    const handleBlurAdults = () => {
        if (editableAdults === '') {
            setEditableAdults('0');
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    },[handleOutsideClick]);

    if (reservationData === null) {
        return <NotFound />;
    }

    return (
        <>
            <ToastContainer /> 
            <div className="container">
                <header className="header">
                    <div className="logo">
                        <img src={logo} alt="Company Logo" />
                    </div>
                    <div className="id-go-logo">
                        <div className='id-go-border'></div>
                        <img src={ID_GO} alt='ID-GO-Logo' />
                    </div>
                </header>
                <div className='bottom'>
                    <div className="reservation-info" style={{ height: `${isExpanded ? (30 + guests.length * 5) * 2.5 : 27 + guests.length * 5}rem` }}>
                        <div className='reservation-data'>
                            <div className="info">
                                <div>RESERVATION NUMBER</div>
                                <div>{reservationData.ReservationNumber}</div>
                            </div>
                            <div className="info">
                                <div>RESERVATION STATUS</div>
                                <div>{reservationData.ReservationStatus}</div>
                            </div>
                            <div className="info">
                                <div>ROOM NUMBER</div>
                                {isEditingRoomNumber ? (
                                    <input
                                        type="text"
                                        value={editableRoomNumber}
                                        onChange={handleRoomNumberChange}
                                        className="form-control"
                                        ref={roomNumberRef}
                                        onKeyPress={(e) => handleKeyPress(e, 'roomNumber')}
                                        onBlur={() => setIsEditingRoomNumber(false)}
                                    />
                                ) : (
                                    <div onClick={handleRoomNumberClick}>{editableRoomNumber === '0' || editableRoomNumber===''? '0' : editableRoomNumber}</div>
                                )}
                            </div>
                            <div className="info">
                                <div>GUEST NAME</div>
                                <div>{reservationData.GuestProfiles[0]?.GuestName}</div>
                            </div>
                            <div className="info">
                                <div>ARRIVAL DATE</div>
                                <div>{formatDate(reservationData.ArrivalDate)}</div>
                            </div>
                            <div className="info">
                                <div>ARRIVAL TIME</div>
                                <div>{formatTime(reservationData.ArrivalDate)}</div>
                            </div>
                            <div className="info">
                                <div>DEPARTURE DATE</div>
                                <div>{formatDate(reservationData.DepartureDate)}</div>
                            </div>
                            <div className="info">
                                <div>ADULT COUNT</div>
                                {isEditingAdults ? (
                                    <input
                                        type="number"
                                        value={editableAdults}
                                        onChange={handleAdultsChange}
                                        className="form-control"
                                        ref={adultsRef}
                                        onKeyPress={(e) => handleKeyPress(e, 'adults')}
                                        onBlur={() => setIsEditingAdults(false)}
                                    />
                                ) : (
                                   // <div onClick={handleAdultsClick}>{editableAdults}</div>
                                   <div >{editableAdults}</div>
                                )
                                }
                            </div>
                            <div className="info">
                                <div>CHILD COUNT</div>
                                <div>{reservationData.Child !== undefined ? reservationData.Child : ''}</div>
                            </div>
                        </div>




                        <div className="guest-details">
                        <div className='add-button-container'>
                            <h4>Guest Details</h4>
                            <button type="button"
                                className={`btn btn-outline-primary ${isButtonClicked ? 'clicked' : ''}`}
                              onClick={addGuest}>
                                Add Guest 
                                
                                <i className="bi bi-plus-lg"></i>
                            </button>
                        </div>
                            {guests.map((guest, index) => (
                                <div className="guest" key={index}>
                                    <button className="accordion" onClick={() => toggleGuestDetails(index)}>
                                        {guest.toUpperCase()}
                                        <i className={`bi ${visibleGuestIndex === index ? 'bi-chevron-up' : 'bi-chevron-down'} accordion-icon`}></i>
                                    </button>
                                    
                                    {visibleGuestIndex === index && (
                                        <GuestDetails
                                        adults={editableAdults}
                                        editroomNumber={editableRoomNumber}
                                            IsAddGuestvisible={guests.length - 1 === index ? true : false}
                                            isVisible={true}
                                            guestData={reservationData.GuestProfiles[index]}
                                            reservationNumber={reservationData.ReservationNumber}
                                            addGuest={addGuest}
                                            isButtonClicked={isButtonClicked}
                                            onSave={async () => {
                                                const data = await fetchReservationData(reservationData.ReservationNameID);
                                                if (data && data.responseData && data.responseData.length > 0) {
                                                    const reservation = data.responseData[0];
                                                    setReservationData(reservation);
                                                    const guestProfiles = reservation.GuestProfiles || [];
                                                    setGuests(guestProfiles.map(profile => profile.GuestName || 'Guest'));
                                                    
                                                    setEditableRoomNumber(reservation.RoomDetails?.RoomNumber ?? '0');
                                                    setEditableAdults(guestProfiles.length);
                                                    refreshReservationData(reservationData.ReservationNumber);
                                                    toggleGuestDetails(index);

                                                } else {
                                                    setReservationData(null); // Mark as invalid
                                                }
                                            }
                                        }
                                        onCancel={async () => {
                                            const data = await fetchReservationData(reservationData.ReservationNameID);
                                            if (data && data.responseData && data.responseData.length > 0) {
                                                const reservation = data.responseData[0];
                                                setReservationData(reservation);
                                                const guestProfiles = reservation.GuestProfiles || [];
                                                setGuests(guestProfiles.map(profile => profile.GuestName || 'Guest'));
                                                setEditableRoomNumber(reservation.RoomDetails?.RoomNumber ?? '0');
                                                setEditableAdults(guestProfiles.length);
                                                refreshReservationData(reservationData.ReservationNumber)
                                                toggleGuestDetails(index);
                                            } else {
                                                setReservationData(null); // Mark as invalid
                                            }
                                        }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
