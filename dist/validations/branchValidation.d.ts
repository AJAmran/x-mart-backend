import { z } from "zod";
export declare const BranchValidation: {
    createBranchValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            code: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE" | "MAINTENANCE"]>>;
            type: z.ZodEnum<["STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE"]>;
            contact: z.ZodObject<{
                phone: z.ZodString;
                email: z.ZodString;
                manager: z.ZodOptional<z.ZodString>;
                emergencyContact: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            }, {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            }>;
            location: z.ZodObject<{
                address: z.ZodString;
                city: z.ZodString;
                state: z.ZodString;
                country: z.ZodString;
                postalCode: z.ZodString;
                coordinates: z.ZodOptional<z.ZodObject<{
                    type: z.ZodLiteral<"Point">;
                    coordinates: z.ZodArray<z.ZodNumber, "many">;
                }, "strip", z.ZodTypeAny, {
                    type: "Point";
                    coordinates: number[];
                }, {
                    type: "Point";
                    coordinates: number[];
                }>>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            }, {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            }>;
            operatingHours: z.ZodArray<z.ZodEffects<z.ZodObject<{
                dayType: z.ZodEnum<["WEEKDAYS" | "WEEKENDS" | "HOLIDAYS"]>;
                openingTime: z.ZodOptional<z.ZodString>;
                closingTime: z.ZodOptional<z.ZodString>;
                is24Hours: z.ZodOptional<z.ZodBoolean>;
                isClosed: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }>, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }>, "many">;
            facilities: z.ZodOptional<z.ZodObject<{
                parking: z.ZodOptional<z.ZodBoolean>;
                wifi: z.ZodOptional<z.ZodBoolean>;
                delivery: z.ZodOptional<z.ZodBoolean>;
                pickup: z.ZodOptional<z.ZodBoolean>;
                dining: z.ZodOptional<z.ZodBoolean>;
                atm: z.ZodOptional<z.ZodBoolean>;
                pharmacy: z.ZodOptional<z.ZodBoolean>;
                bakery: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            }, {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            }>>;
            openingDate: z.ZodDate;
            size: z.ZodOptional<z.ZodNumber>;
            employeeCount: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            type: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE";
            name: string;
            contact: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            };
            location: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            };
            operatingHours: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[];
            openingDate: Date;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            description?: string | undefined;
            size?: number | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }, {
            code: string;
            type: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE";
            name: string;
            contact: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            };
            location: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            };
            operatingHours: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[];
            openingDate: Date;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            description?: string | undefined;
            size?: number | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            code: string;
            type: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE";
            name: string;
            contact: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            };
            location: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            };
            operatingHours: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[];
            openingDate: Date;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            description?: string | undefined;
            size?: number | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        };
    }, {
        body: {
            code: string;
            type: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE";
            name: string;
            contact: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            };
            location: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            };
            operatingHours: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[];
            openingDate: Date;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            description?: string | undefined;
            size?: number | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        };
    }>;
    updateBranchValidationSchema: z.ZodObject<{
        body: z.ZodEffects<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE" | "MAINTENANCE"]>>>;
            type: z.ZodOptional<z.ZodEnum<["STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE"]>>;
            contact: z.ZodOptional<z.ZodObject<{
                phone: z.ZodString;
                email: z.ZodString;
                manager: z.ZodOptional<z.ZodString>;
                emergencyContact: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            }, {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            }>>;
            location: z.ZodOptional<z.ZodObject<{
                address: z.ZodString;
                city: z.ZodString;
                state: z.ZodString;
                country: z.ZodString;
                postalCode: z.ZodString;
                coordinates: z.ZodOptional<z.ZodObject<{
                    type: z.ZodLiteral<"Point">;
                    coordinates: z.ZodArray<z.ZodNumber, "many">;
                }, "strip", z.ZodTypeAny, {
                    type: "Point";
                    coordinates: number[];
                }, {
                    type: "Point";
                    coordinates: number[];
                }>>;
            }, "strip", z.ZodTypeAny, {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            }, {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            }>>;
            operatingHours: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
                dayType: z.ZodEnum<["WEEKDAYS" | "WEEKENDS" | "HOLIDAYS"]>;
                openingTime: z.ZodOptional<z.ZodString>;
                closingTime: z.ZodOptional<z.ZodString>;
                is24Hours: z.ZodOptional<z.ZodBoolean>;
                isClosed: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }>, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }, {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }>, "many">>;
            facilities: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                parking: z.ZodOptional<z.ZodBoolean>;
                wifi: z.ZodOptional<z.ZodBoolean>;
                delivery: z.ZodOptional<z.ZodBoolean>;
                pickup: z.ZodOptional<z.ZodBoolean>;
                dining: z.ZodOptional<z.ZodBoolean>;
                atm: z.ZodOptional<z.ZodBoolean>;
                pharmacy: z.ZodOptional<z.ZodBoolean>;
                bakery: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            }, {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            }>>>;
            openingDate: z.ZodOptional<z.ZodDate>;
            size: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            employeeCount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }, {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }>, {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }, {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        };
    }, {
        body: {
            code?: string | undefined;
            type?: "STANDARD" | "FLAGSHIP" | "EXPRESS" | "WAREHOUSE" | undefined;
            status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            size?: number | undefined;
            contact?: {
                email: string;
                phone: string;
                manager?: string | undefined;
                emergencyContact?: string | undefined;
            } | undefined;
            location?: {
                address: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                coordinates?: {
                    type: "Point";
                    coordinates: number[];
                } | undefined;
            } | undefined;
            operatingHours?: {
                dayType: "WEEKDAYS" | "WEEKENDS" | "HOLIDAYS";
                openingTime?: string | undefined;
                closingTime?: string | undefined;
                is24Hours?: boolean | undefined;
                isClosed?: boolean | undefined;
            }[] | undefined;
            facilities?: {
                parking?: boolean | undefined;
                wifi?: boolean | undefined;
                delivery?: boolean | undefined;
                pickup?: boolean | undefined;
                dining?: boolean | undefined;
                atm?: boolean | undefined;
                pharmacy?: boolean | undefined;
                bakery?: boolean | undefined;
            } | undefined;
            openingDate?: Date | undefined;
            employeeCount?: number | undefined;
            images?: string[] | undefined;
        };
    }>;
    nearbyBranchesValidationSchema: z.ZodObject<{
        query: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
            maxDistance: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            lat: number;
            lng: number;
            maxDistance: number;
        }, {
            lat: number;
            lng: number;
            limit?: number | undefined;
            maxDistance?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        query: {
            limit: number;
            lat: number;
            lng: number;
            maxDistance: number;
        };
    }, {
        query: {
            lat: number;
            lng: number;
            limit?: number | undefined;
            maxDistance?: number | undefined;
        };
    }>;
};
