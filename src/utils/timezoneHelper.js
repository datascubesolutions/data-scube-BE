// Timezone conversion utilities

const TIMEZONE_INFO = {
  "Asia/Kolkata": {
    name: "India Standard Time",
    abbreviation: "IST",
    offset: "+05:30",
    utcOffset: 330, // minutes
  },
  "America/New_York": {
    name: "Eastern Time",
    abbreviation: "EST/EDT",
    offset: "-05:00/-04:00",
    utcOffset: -300, // minutes (EST)
  },
  "America/Los_Angeles": {
    name: "Pacific Time",
    abbreviation: "PST/PDT",
    offset: "-08:00/-07:00",
    utcOffset: -480, // minutes (PST)
  },
  "America/Chicago": {
    name: "Central Time",
    abbreviation: "CST/CDT",
    offset: "-06:00/-05:00",
    utcOffset: -360, // minutes (CST)
  },
  "America/Denver": {
    name: "Mountain Time",
    abbreviation: "MST/MDT",
    offset: "-07:00/-06:00",
    utcOffset: -420, // minutes (MST)
  },
  "America/Phoenix": {
    name: "Mountain Time (No DST)",
    abbreviation: "MST",
    offset: "-07:00",
    utcOffset: -420, // minutes
  },
  "Europe/London": {
    name: "Greenwich Mean Time",
    abbreviation: "GMT/BST",
    offset: "+00:00/+01:00",
    utcOffset: 0, // minutes (GMT)
  },
  "Europe/Paris": {
    name: "Central European Time",
    abbreviation: "CET/CEST",
    offset: "+01:00/+02:00",
    utcOffset: 60, // minutes (CET)
  },
  "Australia/Sydney": {
    name: "Australian Eastern Time",
    abbreviation: "AEST/AEDT",
    offset: "+10:00/+11:00",
    utcOffset: 600, // minutes (AEST)
  },
};

/**
 * Convert time from one timezone to another
 * @param {string} time - Time in HH:MM format
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {string} Converted time in HH:MM format
 */
function convertTime(time, fromTimezone, toTimezone) {
  const [hours, minutes] = time.split(":").map(Number);

  const fromOffset = TIMEZONE_INFO[fromTimezone]?.utcOffset || 0;
  const toOffset = TIMEZONE_INFO[toTimezone]?.utcOffset || 0;

  // Convert to minutes
  let totalMinutes = hours * 60 + minutes;

  // Convert to UTC
  totalMinutes -= fromOffset;

  // Convert to target timezone
  totalMinutes += toOffset;

  // Handle day overflow
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  } else if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
  }

  // Convert back to hours and minutes
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}

/**
 * Get timezone information
 * @param {string} timezone - Timezone identifier
 * @returns {object} Timezone information
 */
function getTimezoneInfo(timezone) {
  return TIMEZONE_INFO[timezone] || TIMEZONE_INFO["Asia/Kolkata"];
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param {string} time - Time in HH:MM format (24-hour)
 * @returns {string} Time in 12-hour format with AM/PM
 */
function convertTo12Hour(time) {
  const [hours, minutes] = time.split(":").map(Number);

  if (hours === 0) {
    return `12:${String(minutes).padStart(2, "0")} AM`;
  } else if (hours < 12) {
    return `${hours}:${String(minutes).padStart(2, "0")} AM`;
  } else if (hours === 12) {
    return `12:${String(minutes).padStart(2, "0")} PM`;
  } else {
    return `${hours - 12}:${String(minutes).padStart(2, "0")} PM`;
  }
}

/**
 * Format time with timezone
 * @param {string} time - Time in HH:MM format
 * @param {string} timezone - Timezone identifier
 * @param {boolean} use12Hour - Use 12-hour format with AM/PM
 * @returns {string} Formatted time with timezone
 */
function formatTimeWithTimezone(time, timezone, use12Hour = true) {
  const info = getTimezoneInfo(timezone);
  const formattedTime = use12Hour ? convertTo12Hour(time) : time;
  return `${formattedTime} ${info.abbreviation}`;
}

/**
 * Get all supported timezones
 * @returns {array} List of supported timezones
 */
function getSupportedTimezones() {
  return Object.keys(TIMEZONE_INFO).map((tz) => ({
    value: tz,
    label: `${TIMEZONE_INFO[tz].name} (${TIMEZONE_INFO[tz].abbreviation})`,
    offset: TIMEZONE_INFO[tz].offset,
  }));
}

/**
 * Convert slot times for display in customer's timezone
 * @param {object} slot - Meeting slot object
 * @param {string} customerTimezone - Customer's timezone
 * @param {boolean} use12Hour - Use 12-hour format with AM/PM (default: true)
 * @returns {object} Slot with converted times
 */
function convertSlotToTimezone(slot, customerTimezone, use12Hour = true) {
  const slotTimezone = slot.timezone || "Asia/Kolkata";

  if (slotTimezone === customerTimezone) {
    const displayStartTime12 = use12Hour
      ? convertTo12Hour(slot.startTime)
      : slot.startTime;
    const displayEndTime12 = use12Hour
      ? convertTo12Hour(slot.endTime)
      : slot.endTime;

    return {
      ...slot,
      displayStartTime: slot.startTime,
      displayEndTime: slot.endTime,
      displayStartTime12Hour: displayStartTime12,
      displayEndTime12Hour: displayEndTime12,
      displayTimezone: customerTimezone,
      displayTimeRange: `${formatTimeWithTimezone(slot.startTime, customerTimezone, use12Hour)} - ${formatTimeWithTimezone(slot.endTime, customerTimezone, use12Hour)}`,
    };
  }

  const displayStartTime = convertTime(
    slot.startTime,
    slotTimezone,
    customerTimezone
  );
  const displayEndTime = convertTime(
    slot.endTime,
    slotTimezone,
    customerTimezone
  );
  const displayStartTime12 = use12Hour
    ? convertTo12Hour(displayStartTime)
    : displayStartTime;
  const displayEndTime12 = use12Hour
    ? convertTo12Hour(displayEndTime)
    : displayEndTime;

  return {
    ...slot,
    displayStartTime,
    displayEndTime,
    displayStartTime12Hour: displayStartTime12,
    displayEndTime12Hour: displayEndTime12,
    displayTimezone: customerTimezone,
    displayTimeRange: `${formatTimeWithTimezone(displayStartTime, customerTimezone, use12Hour)} - ${formatTimeWithTimezone(displayEndTime, customerTimezone, use12Hour)}`,
  };
}

module.exports = {
  convertTime,
  convertTo12Hour,
  getTimezoneInfo,
  formatTimeWithTimezone,
  getSupportedTimezones,
  convertSlotToTimezone,
  TIMEZONE_INFO,
};
