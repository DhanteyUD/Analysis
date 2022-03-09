import type { Trip, Driver } from './types';
const { getTrips, getDriver } = require('api');
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  const trips: Trip[] = await getTrips();
  let billedTotal = 0;
  let cashBilledTotal = 0;
  let nonCashBilledTotal = 0;
  let noOfCashTrips = 0;
  let noOfNonCashTrips = 0;
  const driverMap = new Map();
  for (const trip of trips) {
    const amount = normalizeAmount(trip.billedAmount);
    billedTotal += amount;
    if (trip.isCash) {
      cashBilledTotal += amount;
      noOfCashTrips += 1;
    } else {
      nonCashBilledTotal += amount;
      noOfNonCashTrips++;
    }
    const driverId = trip.driverID;
    const driverDetails = driverMap.get(driverId);
    if (driverDetails !== undefined) {
      driverMap.set(driverId, {
        driverId,
        noOfTrips: driverDetails.noOfTrips + 1,
        totalAmountEarned: driverDetails.totalAmountEarned + amount,
      });
    } else {
      driverMap.set(driverId, {
        driverId,
        noOfTrips: 1,
        totalAmountEarned: amount,
      });
    }
  }
  const driverIds = [...driverMap.keys()];
  const driverDetailsPromises = driverIds.map((driverId) => {
    return getDriver(driverId)
      .then((driverData: Driver) => {
        return {
          ...driverData,
          driverId,
          noOfVehicles: driverData.vehicleID.length,
        };
      })
      .catch(() => {
        return {
          driverId,
          noOfVehicles: 1,
        };
      });
  });
  const driverValues = [...driverMap.values()];
  const driverWithMostTrips = driverValues.sort((first, second) => {
    return second.noOfTrips - first.noOfTrips;
  })[0];
  const highestEarningDriver = driverValues.sort((first, second) => {
    return second.totalAmountEarned - first.totalAmountEarned;
  })[0];
  const driverDetails = await Promise.all(driverDetailsPromises);
  const noOfDriversWithMoreThanOneVehicle = driverDetails.filter(
    (driver) => driver.noOfVehicles > 1
  ).length;
  const driverWithMostTripsData = driverDetails.find(
    (driver) => driver.driverId === driverWithMostTrips.driverId
  );
  const highestEarningDriverData = driverDetails.find(
    (driver) => driver.driverId === highestEarningDriver.driverId
  );
  return {
    noOfCashTrips,
    noOfNonCashTrips,
    billedTotal: to2DecimalPlaces(billedTotal),
    cashBilledTotal: to2DecimalPlaces(cashBilledTotal),
    nonCashBilledTotal: to2DecimalPlaces(nonCashBilledTotal),
    noOfDriversWithMoreThanOneVehicle,
    mostTripsByDriver: {
      name: driverWithMostTripsData.name,
      email: driverWithMostTripsData.email,
      phone: driverWithMostTripsData.phone,
      noOfTrips: driverWithMostTrips.noOfTrips,
      totalAmountEarned: driverWithMostTrips.totalAmountEarned,
    },
    highestEarningDriver: {
      name: highestEarningDriverData.name,
      email: highestEarningDriverData.email,
      phone: highestEarningDriverData.phone,
      noOfTrips: highestEarningDriver.noOfTrips,
      totalAmountEarned: highestEarningDriver.totalAmountEarned,
    },
  };
}
function to2DecimalPlaces(value: number) {
  return Math.trunc(value * 100) / 100;
}
function normalizeAmount(value: string | number) {
  if (typeof value === 'string') {
    return Number(value.replace(',', ''));
  }
  return value;
}

module.exports = analysis;
