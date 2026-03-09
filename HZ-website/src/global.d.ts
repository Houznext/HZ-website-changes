// global.d.ts
declare global {
    interface Window {
      dataLayer: any[]; // You can replace 'any' with a more specific type if needed
    }
  }
  
  // This line ensures the file is treated as a module
  export {};