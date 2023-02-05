export interface SearchSuggestions {
  RecommendedSubCategories: any[];
  RecommendedCategories: any[];
  RecommendedZones: any[];
  RecommendedRegions: any[];
  OfferExactSearch: boolean;
  OfferBackToExtendedSearch: boolean;
}

export interface Filters {
  FilterByCategory: FilterByCategory;
  FilterBySubCategory: FilterBySubCategory;
  FilterByZones: FilterByZones;
  FilterByExperience: FilterByExperience;
  FilterByScope: FilterByScope;
}

export interface FilterByCategory {
  Title: Title;
  QueryParamName: string;
  Options: Option[];
  Selected: number[];
}

export interface Title {
  Key: string;
  Value: string;
}

export interface Option {
  IsSelected: boolean;
  Areas: any[];
  NumberOfJobs: number;
  Link: string;
  Code: number;
  NameInHebrew: string;
}

export interface FilterBySubCategory {
  Title: Title2;
  QueryParamName: string;
  Options: Option2[];
  Selected: number[];
}

export interface Title2 {
  Key: string;
  Value: string;
}

export interface Option2 {
  IsSelected: boolean;
  NumberOfJobs: number;
  Link: string;
  Categories: number[];
  Code: number;
  NameInHebrew: string;
}

export interface FilterByZones {
  Title: Title3;
  QueryParamName: string;
  Options: Option3[];
  Selected: any[];
}

export interface Title3 {
  Key: string;
  Value: string;
}

export interface Option3 {
  IsSelected: boolean;
  Cities: City[];
  NumberOfJobs: number;
  NameInEnglish: string;
  GeoLexId: number;
  RegionIds: number[];
  Link: string;
  Code: number;
  NameInHebrew: string;
}

export interface City {
  Link: string;
  Code: number;
  NameInHebrew: string;
  GeoLexId: number;
  IsSelected: boolean;
  RegionIds: number[];
  NameInEnglish: string;
}

export interface FilterByExperience {
  Title: Title4;
  QueryParamName: string;
  Options: Option4[];
  Selected: number[];
}

export interface Title4 {
  Key: string;
  Value: string;
}

export interface Option4 {
  IsSelected: boolean;
  NumberOfJobs: number;
  Code: number;
  NameInHebrew: string;
}

export interface FilterByScope {
  Title: Title5;
  QueryParamName: string;
  Options: Option5[];
  Selected: number[];
}

export interface Title5 {
  Key: string;
  Value: string;
}

export interface Option5 {
  IsSelected: boolean;
  NumberOfJobs: number;
  Code: number;
  NameInHebrew: string;
}

export interface Japuproperties {
  ShowJAPU: boolean;
  JAPUHeader: string;
  SubHeader: string;
  Categories: Categories;
  Locations: Locations;
  Keywords: any[];
}

export interface SearchProperties {
  WhatFieldText: string;
  WhereFieldText: string;
  Range: Range;
  WhereFieldGeoLex: number;
  WhereFieldAreasString: string;
  GeoLexIds: number[];
  AreasList: number[];
  subcat: number[];
  stsCategory: number;
  catdir: number;
  experience: number[];
  scope: number[];
  ssaen: number;
  IsSearchTerm: boolean;
  CurrentPageNumber: number;
  IsHitechPage: boolean;
  ShowSeparator: boolean;
  SeparatorText: string;
}

export interface Range {
  Code: number;
  NameInHebrew: string;
}

export interface JobAnalytics {
  id: string;
  name: string;
  price: string;
  dimension22: string;
  brand: string;
  category: string;
  position: string;
  quantity: number;
  list: any;
  dimension15: string;
  dimension16: string;
  ppcd: string;
  dimension17: string;
  dimension18: string;
  paidresult: number;
  dimension19: string;
  metric1: string;
  ppcm: string;
  dimension20: string;
  dimension21: string;
  preferred: boolean;
  TransactionId: string;
  revenue: number;
  tax: number;
  shipping: number;
  affiliation: string;
  label: string;
  cd68: string;
  cd69: string;
}

export interface SendCvbuttonModel {
  Text: string;
  ExternalLink: string;
  ButtonLink: string;
}

export interface Company {
  Job2Link: boolean;
  CompanyDisplayName: string;
  ToUrl: string;
  CompanyLogoLink: string;
  HotJobLogoLink: string;
  HotJobBannerLink: string;
  Code: number;
  NameInHebrew: string;
}

export interface JobContent {
  Name: string;
  Filters: string[];
  Salary: number;
  SalaryRangeText: any;
  JobCode: number;
  FullName: string;
  Scopes: Scope[];
  Regions: Region[];
  Zones: Zone[];
  SubCategories: SubCategory[];
  Categories: Category[];
  Requirements: string;
  Description: string;
  Experience: Experience;
  Addresses: Address[];
  DeclarationAllGenders: string;
}

export interface Scope {
  Code: number;
  NameInHebrew: string;
}

export interface Region {
  Code: number;
  NameInHebrew: string;
}

export interface Zone {
  NameInEnglish: string;
  GeoLexId: number;
  RegionIds: number[];
  Link: string;
  Code: number;
  NameInHebrew: string;
}

export interface SubCategory {
  Link: string;
  Categories: number[];
  Code: number;
  NameInHebrew: string;
}

export interface Category {
  Link: string;
  Code: number;
  NameInHebrew: string;
}

export interface Experience {
  Code: number;
  NameInHebrew: string;
}

export interface Address {
  CityId: number;
  City: string;
  CityEnglish: string;
  GeoLexId: number;
  Longitude: number;
  Latitude: number;
  RegionIds: number[];
}

export interface JobInfo {
  Lang: number;
  JumpDateString: string;
  JumpDate: string;
  CanDisplayLinks: boolean;
  HasFilter: boolean;
  RecommendedStatisticsRowId: number;
  SeekerJobStatus: number;
  G4JobScript: any;
  AllowNoCV: boolean;
  Link: string;
  JobCode: number;
  Hash: string;
  EmployerJobCode: string;
  Date: string;
  DisplayDate: string;
  Preferred: boolean;
  TopJob: boolean;
  IsExpired: boolean;
  STSJobCode: number;
  Hot: boolean;
  IsClassifiedJob: boolean;
  IsCorona: boolean;
  IsRecommender: boolean;
}

export interface Seo {
  MetaDataItems: MetaDataItem[];
  CategoryDescription: string;
  SearchHeader: string;
  title: string;
  BreadCrumbs: BreadCrumbs;
  CanonicalUrl: string;
  ArticleSchemaScript: any;
  ArticleFaQSchemaScript: any;
}

export interface MetaDataItem {
  name: string;
  content: string;
  hid: string;
  property: string;
}

export interface BreadCrumbs {
  Keys: Key[];
}

export interface Key {
  KeyValue: KeyValue;
  Link: string;
  IsRelative: boolean;
}

export interface KeyValue {
  Key: string;
  Value: string;
}

export interface DrushimResult {
  JobAnalytics: JobAnalytics;
  SendCVButtonModel: SendCvbuttonModel;
  Code: number;
  Company: Company;
  JobContent: JobContent;
  JobInfo: JobInfo;
}
export interface DrushimAPI {
  ExtentionResultList: any[];
  SearchSuggestions: SearchSuggestions;
  Filters: Filters;
  IsSingleSearchTerm: boolean;
  BlockType: any;
  JAPUProperties: Japuproperties;
  SearchProperties: SearchProperties;
  HotJobs: any[];
  RecommendedJobs: any[];
  TotalSearchResultCount: number;
  TotalPagesNumber: number;
  NextPageNumber: number;
  ResultList: DrushimResult[];
  Count: number;
  IsRedirect: boolean;
  RedirectTo: string;
  IsError: boolean;
  Data: any;
  Errors: Errors;
  ErrorsMessages: ErrorsMessages;
  SSAEvents: any[];
  SEO: Seo;
}
