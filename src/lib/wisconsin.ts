export const WISCONSIN_COUNTIES = [
  "Adams", "Ashland", "Barron", "Bayfield", "Brown", "Buffalo", "Burnett", "Calumet",
  "Chippewa", "Clark", "Columbia", "Crawford", "Dane", "Dodge", "Door", "Douglas",
  "Dunn", "Eau Claire", "Florence", "Fond du Lac", "Forest", "Grant", "Green", "Green Lake",
  "Iowa", "Iron", "Jackson", "Jefferson", "Juneau", "Kenosha", "Kewaunee", "La Crosse",
  "Lafayette", "Langlade", "Lincoln", "Manitowoc", "Marathon", "Marinette", "Marquette", "Menominee",
  "Milwaukee", "Monroe", "Oconto", "Oneida", "Outagamie", "Ozaukee", "Pepin", "Pierce",
  "Polk", "Portage", "Price", "Racine", "Richland", "Rock", "Rusk", "Sauk",
  "Sawyer", "Shawano", "Sheboygan", "St. Croix", "Taylor", "Trempealeau", "Vernon", "Vilas",
  "Walworth", "Washburn", "Washington", "Waukesha", "Waupaca", "Waushara", "Winnebago", "Wood",
] as const;

export const ROLE_OPTIONS = [
  { value: "teen_14_17", label: "Teen (14–17)" },
  { value: "student_18", label: "Student (18)" },
  { value: "parent", label: "Parent or guardian" },
  { value: "employer", label: "Employer" },
  { value: "school_counselor", label: "School or counselor" },
] as const;

export const GRADE_OPTIONS = [
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
  { value: "not_sure", label: "Not sure" },
] as const;

export const INTEREST_OPTIONS = [
  { value: "construction_trades", label: "Construction & trades" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "it_tech", label: "IT & tech" },
  { value: "agriculture", label: "Agriculture" },
  { value: "hospitality", label: "Hospitality" },
  { value: "not_sure", label: "Not sure yet" },
] as const;
export const INTEREST_VALUES = INTEREST_OPTIONS.map((o) => o.value);

export const INDUSTRY_OPTIONS = [
  { value: "construction_trades", label: "Construction & trades" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "it_tech", label: "IT & tech" },
  { value: "agriculture", label: "Agriculture" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
] as const;

// Wisconsin ZIP codes run roughly 53001–54990.
export const WISCONSIN_ZIP_RE = /^(53|54)\d{3}$/;

export function roleLabel(value?: string | null): string {
  return ROLE_OPTIONS.find((o) => o.value === value)?.label ?? (value ?? "");
}

export function interestLabel(value?: string | null): string {
  return INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? (value ?? "");
}

export function gradeLabel(value?: string | null): string {
  return GRADE_OPTIONS.find((o) => o.value === value)?.label ?? (value ?? "");
}
