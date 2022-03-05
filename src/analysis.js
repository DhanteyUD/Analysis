const { getTrips, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  const trips = await getTrips();

  // GET CASH TRIPS AND NON-CASH TRIPS...
  // noOfCashTrips:...
  const cashTrips = trips.filter((trip) => trip.isCash === true);
  const noOfCashTrips = cashTrips.length;

  // noOfNonCashTrips:...
  const nonCashTrips = trips.filter((trip) => trip.isCash !== true);
  const noOfNonCashTrips = nonCashTrips.length;

  // GET TOTAL OF CASH AND NON-CASH TRIPS...
  // billedTotal:...
  const allBills = trips.map((bill) =>
    parseFloat(bill.billedAmount.toString().replace(',', ''))
  );

  const billedTotal = allBills
    .reduce((acc, val) => {
      return acc + val;
    }, 0)
    .toFixed(2);

  // cashBilledTotal:...
  const cashBills = cashTrips.map((bill) =>
    parseFloat(bill.billedAmount.toString().replace(',', ''))
  );

  const cashBilledTotal = cashBills
    .reduce((acc, val) => {
      return acc + val;
    }, 0)
    .toFixed(2);

  // nonCashBilledTotal:...
  const nonCashBills = nonCashTrips.map((bill) =>
    parseFloat(bill.billedAmount.toString().replace(',', ''))
  );

  const nonCashBilledTotal = nonCashBills
    .reduce((acc, val) => {
      return acc + val;
    }, 0)
    .toFixed(2);

  // GET NUMBER OF DRIVERS WITH MORE THAN ONE VEHICLE...
  // Get driver info from trips...
  const tripsPromise = trips.map(async (trip) => {
    try {
      const driver = await getDriver(trip.driverID);
      if (driver)
        return {
          driverID: trip.driverID,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          billedAmount: parseFloat(
            trip.billedAmount.toString().replace(',', '')
          ),
        };
    } catch (error) {}
  });

  // Unwrap promise into tripInfo...
  let tripsInfo = await Promise.all(tripsPromise);
  tripsInfo = tripsInfo.filter(Boolean);

  // Get unique driver info...
  const uniqueTripsInfo = Array.from(new Set(tripsInfo));

  // key,value pair of driverID and noOfTrips...
  const noOfTripsByDriver = {};

  for (let info of uniqueTripsInfo) {
    if (noOfTripsByDriver.hasOwnProperty(info.driverID)) {
      noOfTripsByDriver[info.driverID]++;
    } else {
      noOfTripsByDriver[info.driverID] = 1;
    }
  }

  // Get driver(s) with more than one vehicle from drivers...
  const driverIds = uniqueTripsInfo.map((driver) => driver.driverID);
  const uniqueDriverIDs = Array.from(new Set(driverIds));
  let driverVehicles = [];

  const driversPromise = uniqueDriverIDs.map(async (id) => {
    try {
      const driver = await getDriver(id);
      if (driver) {
        let vehicleAmount = Array.from(new Set(driver.vehicleID)).length;
        return vehicleAmount;
      }
    } catch (error) {}
  });

  let driversInfo = await Promise.all(driversPromise);
  driversInfo = driversInfo.filter(Boolean);

  driversInfo.forEach((vehicleAmount) => {
    if (vehicleAmount > 1) {
      driverVehicles.push(vehicleAmount);
    }
  });

  // noOfDriversWithMoreThanOneVehicle:...
  const noOfDriversWithMoreThanOneVehicle = driverVehicles.length;

  // GET MAXIMUM NUMBER OF TRIPS TAKEN BY A DRIVER...
  const tripsByDrivers = Object.values(noOfTripsByDriver);
  const maxTrips = Math.max(...tripsByDrivers);

  // mostTripsByDriver:...
  let topDriver = {};

  for (let trip of tripsInfo) {
    if (noOfTripsByDriver[trip.driverID] === maxTrips) {
      topDriver[trip.driverID] = {
        name: trip.name,
        email: trip.email,
        phone: trip.phone,
        noOfTrips: maxTrips,
      };
    }
  }

  // totalAmountEarned:...
  trips.forEach((trip) => {
    if (topDriver[trip.driverID]) {
      if (topDriver[trip.driverID].hasOwnProperty('totalAmountEarned')) {
        let amountEarned = parseFloat(
          trip.billedAmount.toString().replace(',', '')
        );
        topDriver[trip.driverID].totalAmountEarned += amountEarned;
      } else {
        let amountEarned = parseFloat(
          trip.billedAmount.toString().replace(',', '')
        );
        topDriver[trip.driverID].totalAmountEarned = amountEarned;
      }
    }
  });

  // Object literal for mostTripsByDriver:...
  const mostTripsByDriver = Object.values(topDriver)[0];

  // GET INFO OF HIGHEST EARNING DRIVER...
  const topDrivers = Object.values(topDriver);
  topDrivers.sort((a, b) => a.billedAmount - b.billedAmount);

  // Object literal for highestEarningDriver:...
  const highestEarner = topDrivers[topDrivers.length - 1];

  // Return object literal/structure for result...
  return {
    noOfCashTrips: +noOfCashTrips,
    noOfNonCashTrips: +noOfNonCashTrips,
    billedTotal: +billedTotal,
    cashBilledTotal: +cashBilledTotal,
    nonCashBilledTotal: +nonCashBilledTotal,
    noOfDriversWithMoreThanOneVehicle: +noOfDriversWithMoreThanOneVehicle,
    mostTripsByDriver: mostTripsByDriver,
    highestEarningDriver: highestEarner,
  };
}

analysis();

module.exports = analysis;
