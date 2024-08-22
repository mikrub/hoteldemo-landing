import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { Alert, AlertDescription } from "./components/ui/alert"
import { InfoIcon } from 'lucide-react'

const HotelLandingPage = () => {
  const [formData, setFormData] = useState({
    arrivalDate: '',
    departureDate: '',
    adults: '1',
    children: '0',
  });
  const [childrenAges, setChildrenAges] = useState([]);
  const [allParams, setAllParams] = useState({});
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    // Google Tag Manager script (head)
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-5N983T22');
    `;
    document.head.appendChild(gtmScript);

    // Google Tag Manager noscript (body)
    const gtmNoscript = document.createElement('noscript');
    const gtmIframe = document.createElement('iframe');
    gtmIframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-5N983T22";
    gtmIframe.height = "0";
    gtmIframe.width = "0";
    gtmIframe.style.display = "none";
    gtmIframe.style.visibility = "hidden";
    gtmNoscript.appendChild(gtmIframe);
    document.body.insertBefore(gtmNoscript, document.body.firstChild);

    // Cookiebot script
    const cookiebotScript = document.createElement('script');
    cookiebotScript.id = 'Cookiebot';
    cookiebotScript.src = 'https://consent.cookiebot.com/uc.js';
    cookiebotScript.setAttribute('data-cbid', '8b2eed2d-1720-4715-943d-257868958c55');
    cookiebotScript.setAttribute('data-blockingmode', 'auto');
    cookiebotScript.async = true;
    document.head.appendChild(cookiebotScript);
    
    // Google Analytics tracking code
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-16667572455";
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16667572455');
    `;
    document.head.appendChild(script2);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      document.head.removeChild(gtmScript);
      document.body.removeChild(gtmNoscript);
      document.head.removeChild(cookiebotScript);
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  useEffect(() => {
    // Function to get URL parameters
    const getUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      return Object.fromEntries(searchParams.entries());
    };

    // Prefill form with URL parameters
    const params = getUrlParams();
    if (Object.keys(params).length > 0) {
      setFormData(prevData => ({
        ...prevData,
        ...params
      }));
      setUrlParamsApplied(true);
    }

    // Set initial allParams
    setAllParams(params);

    // Initialize children ages if present in URL params
    if (params.childrenAges) {
      setChildrenAges(params.childrenAges.split(',').map(age => age.trim()));
    }
  }, []);

  useEffect(() => {
    // Update allParams whenever formData or childrenAges change
    setAllParams(prevParams => ({
      ...prevParams,
      ...formData,
      childrenAges: childrenAges.join(',')
    }));
  }, [formData, childrenAges]);

  useEffect(() => {
    // Adjust childrenAges array when number of children changes
    const numChildren = parseInt(formData.children, 10) || 0;
    setChildrenAges(prevAges => {
      const newAges = [...prevAges];
      if (newAges.length < numChildren) {
        // Add empty strings for new children
        return newAges.concat(Array(numChildren - newAges.length).fill(''));
      } else if (newAges.length > numChildren) {
        // Remove extra age inputs
        return newAges.slice(0, numChildren);
      }
      return newAges;
    });
  }, [formData.children]);

  const constructBookingUrl = useCallback(() => {
    const bookingEngineBaseUrl = 'https://smartbooking.hotelnet.biz/home/main';
    
    // Construct the 'camere' parameter
    let camereParam = `1!${formData.adults}`;
    if (parseInt(formData.children, 10) > 0) {
      camereParam += `-${formData.children}-${childrenAges.join('-')}`;
    }
    
    const urlParams = new URLSearchParams({
      hotel: '8784',
      channel: '0000',
      lingua: allParams.lingua || 'EN',  // Default to 'EN' if not provided in query string
      arrivo: formData.arrivalDate,
      partenza: formData.departureDate,
    });

    // Add camere parameter without encoding the "!"
    urlParams.append('camere', camereParam);

    // Add any additional parameters from allParams that aren't already included
    Object.entries(allParams).forEach(([key, value]) => {
      if (!['hotel', 'channel', 'lingua', 'arrivo', 'partenza', 'camere'].includes(key)) {
        urlParams.append(key, value);
      }
    });

    return `${bookingEngineBaseUrl}?${urlParams.toString().replace(/%21/g, '!')}`;
  }, [formData, childrenAges, allParams]);

  useEffect(() => {
    // Update booking URL whenever form data changes
    setBookingUrl(constructBookingUrl());
  }, [constructBookingUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleChildAgeChange = (index, value) => {
    setChildrenAges(prevAges => {
      const newAges = [...prevAges];
      newAges[index] = value;
      return newAges;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = bookingUrl;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px]">
        <CardHeader>
          <CardTitle>Book Your Stay</CardTitle>
          <CardDescription>Exclusive offer for a limited time!</CardDescription>
          {urlParamsApplied && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Form pre-filled with URL parameters
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  name="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="adults">Number of Adults</Label>
                <Input
                  id="adults"
                  name="adults"
                  type="number"
                  value={formData.adults}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="children">Number of Children</Label>
                <Input
                  id="children"
                  name="children"
                  type="number"
                  value={formData.children}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              {childrenAges.map((age, index) => (
                <div key={index} className="flex flex-col space-y-1.5">
                  <Label htmlFor={`childAge${index}`}>Age of Child {index + 1}</Label>
                  <Input
                    id={`childAge${index}`}
                    name={`childAge${index}`}
                    type="number"
                    value={age}
                    onChange={(e) => handleChildAgeChange(index, e.target.value)}
                    required
                    min="0"
                    max="17"
                  />
                </div>
              ))}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit" onClick={handleSubmit}>Book Now</Button>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Booking URL:</h3>
            <pre className="bg-gray-100 p-2 rounded-md text-sm overflow-x-auto break-all">
              {bookingUrl}
            </pre>
          </div>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Parameters to be sent:</h3>
            <pre className="bg-gray-100 p-2 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(allParams, null, 2)}
            </pre>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HotelLandingPage;