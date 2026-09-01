export interface PropertyCounty { number: string; name: string; }
export interface PropertyDetails {
  address: string; city: string; state: string; zipCode: string; dorUseCode: string | null;
  actualYearBuilt: number | null; effectiveYearBuilt: number | null; livingArea: number | null; landSquareFeet: number | null;
}
export interface PropertyOwner {
  name: string; address1: string | null; address2: string | null; city: string | null;
  state: string | null; zipCode: string | null; mailingAddress: string;
}
export interface PropertyValuation {
  justValue: number | null; assessedValueSchoolDistrict: number | null;
  assessedValueNonSchoolDistrict: number | null; landValue: number | null;
}
export interface PropertySale {
  sequence: number; salePrice: number | null; saleYear: number | null; saleMonth: number | null;
  qualificationCode: string | null; officialRecordBook: string | null; officialRecordPage: string | null;
}
export interface PropertyDataSource { name: string; assessmentYear: number | null; isSampleData: boolean; }
export interface PropertyRecord {
  parcelNumber: string; county: PropertyCounty; property: PropertyDetails; owner: PropertyOwner;
  valuation: PropertyValuation; sales: PropertySale[]; dataSource: PropertyDataSource;
}
