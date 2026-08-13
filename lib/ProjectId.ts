// export const CurrentProjectId = "cmrf4x7u50000i4t3yrny876w";
// export const APP_URL = "http://localhost:5000";

export const APP_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;
export const CurrentProjectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
export const currentURL = process.env.NEXT_PUBLIC_CURRENT_URL as string;
