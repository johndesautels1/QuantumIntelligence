/**
 * CLUES™ Quantum Property Intelligence System
 * 90+ Variable Weighted Scoring Engine
 * Core intelligence algorithm for property analysis
 *
 * @version 1.0.0
 */

class ScoringEngine {
    constructor() {
        // Define all 100 variables with default weights
        this.VARIABLE_SYSTEM = this.initializeVariables();
        this.WEIGHT_PROFILES = this.initializeProfiles();
    }

    /**
     * Initialize 100+ variables across 8 categories
     */
    initializeVariables() {
        return {
            // ===== CATEGORY 1: PROPERTY PHYSICAL (15 variables) =====
            property_physical: {
                sqft_living: {
                    weight: 0.15,
                    range: [500, 10000],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Living square footage'
                },
                sqft_lot: {
                    weight: 0.08,
                    range: [1000, 50000],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Lot size square footage'
                },
                bedrooms: {
                    weight: 0.12,
                    range: [1, 8],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Number of bedrooms'
                },
                bathrooms_total: {
                    weight: 0.10,
                    range: [1, 6],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Total bathrooms (full + half)'
                },
                year_built: {
                    weight: 0.07,
                    range: [1900, 2025],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Year property was built'
                },
                garage_spaces: {
                    weight: 0.05,
                    range: [0, 4],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Garage parking spaces'
                },
                stories: {
                    weight: 0.03,
                    range: [1, 3],
                    importance: 'low',
                    higher_is_better: false,
                    description: 'Number of stories'
                },
                condition_rating: {
                    weight: 0.12,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Overall property condition'
                },
                roof_age: {
                    weight: 0.06,
                    range: [0, 50],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Age of roof in years'
                },
                roof_type_quality: {
                    weight: 0.03,
                    range: [0, 10],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Quality rating of roof material'
                },
                windows_efficiency: {
                    weight: 0.03,
                    range: [0, 10],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Window energy efficiency rating'
                },
                insulation_rating: {
                    weight: 0.04,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Home insulation quality'
                },
                foundation_quality: {
                    weight: 0.08,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Foundation condition rating'
                },
                accessibility_features: {
                    weight: 0.02,
                    range: [0, 10],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Accessibility/ADA features'
                },
                construction_quality: {
                    weight: 0.07,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Overall build quality'
                }
            },

            // ===== CATEGORY 2: FINANCIAL (12 variables) =====
            financial: {
                price_current: {
                    weight: 0.20,
                    range: [50000, 5000000],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Current listing price'
                },
                price_per_sqft: {
                    weight: 0.15,
                    range: [50, 1000],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Price per square foot'
                },
                price_vs_market: {
                    weight: 0.18,
                    range: [-50, 50],
                    importance: 'critical',
                    higher_is_better: false,
                    description: '% above/below market value'
                },
                price_history_volatility: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Price change volatility score'
                },
                annual_taxes: {
                    weight: 0.12,
                    range: [500, 50000],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Annual property taxes'
                },
                hoa_fees_monthly: {
                    weight: 0.10,
                    range: [0, 1000],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Monthly HOA fees'
                },
                insurance_cost_annual: {
                    weight: 0.07,
                    range: [500, 10000],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Estimated annual insurance'
                },
                utility_costs_monthly: {
                    weight: 0.05,
                    range: [100, 1000],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Estimated monthly utilities'
                },
                maintenance_cost_annual: {
                    weight: 0.06,
                    range: [1000, 20000],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Estimated annual maintenance'
                },
                appreciation_rate_5yr: {
                    weight: 0.15,
                    range: [-10, 30],
                    importance: 'high',
                    higher_is_better: true,
                    description: '5-year appreciation rate %'
                },
                rental_income_potential: {
                    weight: 0.09,
                    range: [0, 10000],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Monthly rental income potential'
                },
                cap_rate: {
                    weight: 0.08,
                    range: [0, 15],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Capitalization rate %'
                }
            },

            // ===== CATEGORY 3: LOCATION & NEIGHBORHOOD (18 variables) =====
            location: {
                walk_score: {
                    weight: 0.12,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Walk Score walkability rating'
                },
                transit_score: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Public transit access score'
                },
                bike_score: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Bike-friendly rating'
                },
                crime_index: {
                    weight: 0.15,
                    range: [0, 100],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Crime rate (lower is better)'
                },
                school_rating_elementary: {
                    weight: 0.12,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Elementary school rating'
                },
                school_rating_middle: {
                    weight: 0.10,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Middle school rating'
                },
                school_rating_high: {
                    weight: 0.10,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'High school rating'
                },
                commute_time_work: {
                    weight: 0.14,
                    range: [0, 120],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Commute time to work (minutes)'
                },
                distance_shopping_miles: {
                    weight: 0.06,
                    range: [0, 20],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Distance to shopping'
                },
                distance_hospital_miles: {
                    weight: 0.08,
                    range: [0, 30],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Distance to hospital'
                },
                distance_airport_miles: {
                    weight: 0.04,
                    range: [0, 100],
                    importance: 'low',
                    higher_is_better: false,
                    description: 'Distance to airport'
                },
                noise_level: {
                    weight: 0.09,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Ambient noise level'
                },
                air_quality_index: {
                    weight: 0.10,
                    range: [0, 500],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Air quality index (lower better)'
                },
                neighborhood_growth_rate: {
                    weight: 0.11,
                    range: [-10, 30],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Neighborhood growth %'
                },
                new_development_score: {
                    weight: 0.07,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'New development activity'
                },
                gentrification_index: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Gentrification indicator'
                },
                parks_recreation_access: {
                    weight: 0.06,
                    range: [0, 10],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Access to parks/recreation'
                },
                restaurant_retail_density: {
                    weight: 0.05,
                    range: [0, 100],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Dining/retail options nearby'
                }
            },

            // ===== CATEGORY 4: MARKET CONDITIONS (10 variables) =====
            market: {
                days_on_market: {
                    weight: 0.18,
                    range: [0, 365],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Days on market'
                },
                list_to_sale_ratio: {
                    weight: 0.15,
                    range: [0.5, 1.5],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'List to sale price ratio'
                },
                inventory_level_months: {
                    weight: 0.12,
                    range: [0, 12],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Months of inventory'
                },
                absorption_rate: {
                    weight: 0.10,
                    range: [0, 12],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Market absorption rate'
                },
                competitive_listings_count: {
                    weight: 0.14,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Competing listings'
                },
                recent_sales_volume: {
                    weight: 0.09,
                    range: [0, 1000],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Recent sales activity'
                },
                price_trend_30day_pct: {
                    weight: 0.11,
                    range: [-20, 20],
                    importance: 'high',
                    higher_is_better: true,
                    description: '30-day price trend %'
                },
                price_trend_90day_pct: {
                    weight: 0.10,
                    range: [-20, 20],
                    importance: 'high',
                    higher_is_better: true,
                    description: '90-day price trend %'
                },
                seasonality_factor: {
                    weight: 0.06,
                    range: [0, 2],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Seasonal market factor'
                },
                interest_rate_impact: {
                    weight: 0.13,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Interest rate impact score'
                }
            },

            // ===== CATEGORY 5: RISK FACTORS (15 variables) =====
            risk: {
                flood_zone_risk: {
                    weight: 0.20,
                    range: [0, 100],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Flood zone risk score'
                },
                earthquake_risk: {
                    weight: 0.12,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Earthquake risk'
                },
                fire_risk: {
                    weight: 0.12,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Wildfire risk'
                },
                hurricane_risk: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Hurricane risk'
                },
                foundation_issues_score: {
                    weight: 0.15,
                    range: [0, 100],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Foundation problem score'
                },
                roof_issues_score: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Roof problem score'
                },
                electrical_issues_score: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Electrical issues'
                },
                plumbing_issues_score: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Plumbing issues'
                },
                mold_presence_score: {
                    weight: 0.14,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Mold risk/presence'
                },
                asbestos_risk: {
                    weight: 0.09,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Asbestos presence risk'
                },
                lead_paint_risk: {
                    weight: 0.07,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'Lead paint risk'
                },
                radon_level: {
                    weight: 0.06,
                    range: [0, 20],
                    importance: 'low',
                    higher_is_better: false,
                    description: 'Radon gas level'
                },
                environmental_hazards: {
                    weight: 0.11,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Environmental hazards nearby'
                },
                title_issues_score: {
                    weight: 0.13,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Title/legal issues'
                },
                hoa_litigation_risk: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: false,
                    description: 'HOA legal issues'
                }
            },

            // ===== CATEGORY 6: LIFESTYLE & AMENITIES (12 variables) =====
            lifestyle: {
                pool_present: {
                    weight: 0.10,
                    range: [0, 1],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Swimming pool'
                },
                deck_patio_sqft: {
                    weight: 0.06,
                    range: [0, 1000],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Deck/patio square feet'
                },
                fireplace_count: {
                    weight: 0.05,
                    range: [0, 3],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Number of fireplaces'
                },
                kitchen_update_score: {
                    weight: 0.12,
                    range: [0, 10],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Kitchen modernization'
                },
                bathroom_update_score: {
                    weight: 0.10,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Bathroom updates'
                },
                hardwood_floors_pct: {
                    weight: 0.07,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: '% hardwood flooring'
                },
                smart_home_features_count: {
                    weight: 0.09,
                    range: [0, 20],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Smart home features'
                },
                energy_efficiency_score: {
                    weight: 0.11,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Energy efficiency rating'
                },
                view_quality_score: {
                    weight: 0.08,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'View quality rating'
                },
                privacy_rating: {
                    weight: 0.07,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Privacy from neighbors'
                },
                outdoor_space_sqft: {
                    weight: 0.08,
                    range: [0, 10000],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Usable outdoor space'
                },
                finished_basement_sqft: {
                    weight: 0.09,
                    range: [0, 3000],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Finished basement square feet'
                }
            },

            // ===== CATEGORY 7: INVESTMENT POTENTIAL (10 variables) =====
            investment: {
                cash_flow_monthly: {
                    weight: 0.15,
                    range: [-5000, 5000],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Monthly cash flow'
                },
                roi_estimate_annual: {
                    weight: 0.18,
                    range: [-10, 30],
                    importance: 'critical',
                    higher_is_better: true,
                    description: 'Estimated annual ROI %'
                },
                equity_potential: {
                    weight: 0.14,
                    range: [0, 500000],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Equity building potential'
                },
                value_add_opportunities_score: {
                    weight: 0.12,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Value-add renovation potential'
                },
                development_potential_score: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Development/expansion potential'
                },
                rental_demand_score: {
                    weight: 0.13,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Rental market demand'
                },
                tenant_quality_score: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Tenant demographic quality'
                },
                vacancy_risk_score: {
                    weight: 0.11,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: false,
                    description: 'Vacancy risk (lower better)'
                },
                market_cycle_position: {
                    weight: 0.09,
                    range: [0, 10],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Market cycle timing score'
                },
                comparable_performance_score: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Performance vs comparables'
                }
            },

            // ===== CATEGORY 8: COMPETITIVE POSITION (8 variables) =====
            competitive: {
                unique_features_count: {
                    weight: 0.12,
                    range: [0, 20],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Unique selling features'
                },
                condition_vs_comps_score: {
                    weight: 0.18,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Condition vs comparable properties'
                },
                pricing_vs_comps_pct: {
                    weight: 0.20,
                    range: [-50, 50],
                    importance: 'critical',
                    higher_is_better: false,
                    description: 'Price vs comps % (lower better)'
                },
                location_vs_comps_score: {
                    weight: 0.15,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Location advantage vs comps'
                },
                features_vs_comps_score: {
                    weight: 0.14,
                    range: [0, 100],
                    importance: 'high',
                    higher_is_better: true,
                    description: 'Feature set vs comps'
                },
                presentation_quality_score: {
                    weight: 0.10,
                    range: [0, 100],
                    importance: 'medium',
                    higher_is_better: true,
                    description: 'Photos/staging quality'
                },
                marketing_reach_score: {
                    weight: 0.08,
                    range: [0, 100],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Marketing exposure'
                },
                showing_availability_score: {
                    weight: 0.06,
                    range: [0, 100],
                    importance: 'low',
                    higher_is_better: true,
                    description: 'Showing ease/availability'
                }
            }
        };
    }

    /**
     * Initialize weight profiles for different buyer types
     */
    initializeProfiles() {
        return {
            first_time_buyer: {
                property_physical: 1.0,
                financial: 1.5,
                location: 1.2,
                market: 1.0,
                risk: 0.8,
                lifestyle: 1.2,
                investment: 0.5,
                competitive: 0.9
            },
            investor: {
                property_physical: 0.7,
                financial: 1.5,
                location: 0.7,
                market: 1.3,
                risk: 1.2,
                lifestyle: 0.3,
                investment: 2.0,
                competitive: 1.1
            },
            family: {
                property_physical: 1.3,
                financial: 1.1,
                location: 1.8,
                market: 0.8,
                risk: 1.5,
                lifestyle: 1.4,
                investment: 0.6,
                competitive: 0.6
            },
            luxury: {
                property_physical: 1.2,
                financial: 0.6,
                location: 1.7,
                market: 0.7,
                risk: 0.8,
                lifestyle: 2.0,
                investment: 0.5,
                competitive: 1.5
            },
            downsizer: {
                property_physical: 0.8,
                financial: 1.3,
                location: 1.4,
                market: 0.9,
                risk: 1.2,
                lifestyle: 1.3,
                investment: 0.7,
                competitive: 0.8
            },
            balanced: {
                property_physical: 1.0,
                financial: 1.0,
                location: 1.0,
                market: 1.0,
                risk: 1.0,
                lifestyle: 1.0,
                investment: 1.0,
                competitive: 1.0
            }
        };
    }

    /**
     * Calculate composite score for a property
     * @param {Object} property - Property data object
     * @param {Object} weightProfile - Weight profile (or profile name string)
     * @param {Object} customWeights - Optional custom variable weights
     * @returns {Object} Detailed scoring breakdown
     */
    calculateScore(property, weightProfile = 'balanced', customWeights = {}) {
        // Get profile multipliers
        const profile = typeof weightProfile === 'string'
            ? this.WEIGHT_PROFILES[weightProfile]
            : weightProfile;

        const scores = {
            overall: 0,
            by_category: {},
            by_variable: {},
            total_weight: 0
        };

        // Calculate for each category
        for (const [categoryName, variables] of Object.entries(this.VARIABLE_SYSTEM)) {
            let categoryScore = 0;
            let categoryWeight = 0;

            // Calculate for each variable in category
            for (const [variableName, config] of Object.entries(variables)) {
                // Get property value
                const rawValue = this.getPropertyValue(property, variableName);

                // Normalize to 0-100
                const normalizedValue = this.normalize(rawValue, config.range, config.higher_is_better);

                // Get weight (custom or default)
                const baseWeight = customWeights[variableName] || config.weight;

                // Apply profile multiplier
                const profileMultiplier = profile[categoryName] || 1.0;
                const finalWeight = baseWeight * profileMultiplier;

                // Calculate weighted score
                const weightedScore = normalizedValue * finalWeight;

                categoryScore += weightedScore;
                categoryWeight += finalWeight;

                // Store variable-level score
                scores.by_variable[variableName] = {
                    raw_value: rawValue,
                    normalized: normalizedValue,
                    weight: finalWeight,
                    weighted_score: weightedScore,
                    importance: config.importance,
                    description: config.description
                };
            }

            // Store category score
            scores.by_category[categoryName] = {
                score: categoryWeight > 0 ? (categoryScore / categoryWeight) * 100 : 0,
                weight: categoryWeight
            };

            scores.total_weight += categoryWeight;
            scores.overall += categoryScore;
        }

        // Calculate final overall score (0-100)
        scores.overall = scores.total_weight > 0
            ? (scores.overall / scores.total_weight) * 100
            : 0;

        return scores;
    }

    /**
     * Normalize a value to 0-100 scale
     */
    normalize(value, range, higher_is_better = true) {
        if (value === null || value === undefined) return 50; // Neutral if missing

        const [min, max] = range;

        // Clamp value to range
        const clampedValue = Math.max(min, Math.min(max, value));

        // Normalize to 0-100
        let normalized = ((clampedValue - min) / (max - min)) * 100;

        // Invert if lower is better
        if (!higher_is_better) {
            normalized = 100 - normalized;
        }

        return normalized;
    }

    /**
     * Extract property value for a given variable
     */
    getPropertyValue(property, variableName) {
        // Map variable names to property data paths
        const mapping = {
            // Physical
            sqft_living: property.square_feet?.living,
            sqft_lot: property.square_feet?.lot,
            bedrooms: property.bedrooms,
            bathrooms_total: property.bathrooms?.total,
            year_built: property.year_built,
            garage_spaces: property.garage_spaces,
            stories: property.stories,
            condition_rating: property.analytics?.variable_values?.condition_rating || 7,
            roof_age: new Date().getFullYear() - (property.year_built || 2000),
            roof_type_quality: property.analytics?.variable_values?.roof_type_quality || 5,
            windows_efficiency: property.analytics?.variable_values?.windows_efficiency || 5,
            insulation_rating: property.analytics?.variable_values?.insulation_rating || 5,
            foundation_quality: property.analytics?.variable_values?.foundation_quality || 7,
            accessibility_features: property.analytics?.variable_values?.accessibility_features || 0,
            construction_quality: property.analytics?.variable_values?.construction_quality || 7,

            // Financial
            price_current: property.price?.current,
            price_per_sqft: property.analytics?.price_per_sqft,
            price_vs_market: property.analytics?.price_vs_market,
            price_history_volatility: property.analytics?.variable_values?.price_history_volatility || 10,
            annual_taxes: property.taxes?.annual_amount,
            hoa_fees_monthly: property.hoa_fees?.monthly || 0,
            insurance_cost_annual: property.analytics?.variable_values?.insurance_cost_annual || 1200,
            utility_costs_monthly: property.analytics?.variable_values?.utility_costs_monthly || 200,
            maintenance_cost_annual: property.analytics?.variable_values?.maintenance_cost_annual || 2000,
            appreciation_rate_5yr: property.analytics?.appreciation_rate || 5,
            rental_income_potential: property.analytics?.variable_values?.rental_income_potential || 0,
            cap_rate: property.analytics?.variable_values?.cap_rate || 0,

            // Location
            walk_score: property.analytics?.walk_score,
            transit_score: property.analytics?.transit_score,
            bike_score: property.analytics?.bike_score,
            crime_index: property.analytics?.crime_index,
            school_rating_elementary: property.analytics?.school_ratings?.elementary,
            school_rating_middle: property.analytics?.school_ratings?.middle,
            school_rating_high: property.analytics?.school_ratings?.high,
            commute_time_work: property.analytics?.variable_values?.commute_time_work || 30,
            distance_shopping_miles: property.analytics?.variable_values?.distance_shopping_miles || 2,
            distance_hospital_miles: property.analytics?.variable_values?.distance_hospital_miles || 5,
            distance_airport_miles: property.analytics?.variable_values?.distance_airport_miles || 20,
            noise_level: property.analytics?.variable_values?.noise_level || 30,
            air_quality_index: property.analytics?.variable_values?.air_quality_index || 50,
            neighborhood_growth_rate: property.analytics?.variable_values?.neighborhood_growth_rate || 5,
            new_development_score: property.analytics?.variable_values?.new_development_score || 5,
            gentrification_index: property.analytics?.variable_values?.gentrification_index || 50,
            parks_recreation_access: property.analytics?.variable_values?.parks_recreation_access || 5,
            restaurant_retail_density: property.analytics?.variable_values?.restaurant_retail_density || 50,

            // Market
            days_on_market: property.days_on_market?.current,
            list_to_sale_ratio: property.analytics?.variable_values?.list_to_sale_ratio || 0.98,
            inventory_level_months: property.analytics?.variable_values?.inventory_level_months || 3,
            absorption_rate: property.analytics?.variable_values?.absorption_rate || 6,
            competitive_listings_count: property.analytics?.variable_values?.competitive_listings_count || 10,
            recent_sales_volume: property.analytics?.variable_values?.recent_sales_volume || 50,
            price_trend_30day_pct: property.analytics?.variable_values?.price_trend_30day_pct || 0,
            price_trend_90day_pct: property.analytics?.variable_values?.price_trend_90day_pct || 2,
            seasonality_factor: property.analytics?.variable_values?.seasonality_factor || 1,
            interest_rate_impact: property.analytics?.variable_values?.interest_rate_impact || 5,

            // Risk
            flood_zone_risk: property.analytics?.flood_zone ? 80 : 10,
            earthquake_risk: property.analytics?.earthquake_risk === 'high' ? 80 : 20,
            fire_risk: property.analytics?.fire_risk === 'high' ? 80 : 20,
            hurricane_risk: property.analytics?.variable_values?.hurricane_risk || 10,
            foundation_issues_score: property.inspection?.red_flags?.find(f => f.category === 'foundation')?.severity === 'critical' ? 80 : 10,
            roof_issues_score: property.inspection?.red_flags?.find(f => f.category === 'roof')?.severity === 'critical' ? 80 : 10,
            electrical_issues_score: property.inspection?.red_flags?.find(f => f.category === 'electrical')?.severity === 'critical' ? 80 : 10,
            plumbing_issues_score: property.inspection?.red_flags?.find(f => f.category === 'plumbing')?.severity === 'critical' ? 80 : 10,
            mold_presence_score: property.analytics?.variable_values?.mold_presence_score || 10,
            asbestos_risk: property.year_built < 1980 ? 60 : 10,
            lead_paint_risk: property.year_built < 1978 ? 60 : 10,
            radon_level: property.analytics?.variable_values?.radon_level || 2,
            environmental_hazards: property.analytics?.variable_values?.environmental_hazards || 10,
            title_issues_score: property.analytics?.variable_values?.title_issues_score || 5,
            hoa_litigation_risk: property.analytics?.variable_values?.hoa_litigation_risk || 10,

            // Lifestyle
            pool_present: property.features?.exterior?.includes('pool') ? 1 : 0,
            deck_patio_sqft: property.analytics?.variable_values?.deck_patio_sqft || 0,
            fireplace_count: property.features?.interior?.filter(f => f.includes('fireplace')).length || 0,
            kitchen_update_score: property.analytics?.variable_values?.kitchen_update_score || 5,
            bathroom_update_score: property.analytics?.variable_values?.bathroom_update_score || 5,
            hardwood_floors_pct: property.features?.interior?.includes('hardwood') ? 80 : 20,
            smart_home_features_count: property.analytics?.variable_values?.smart_home_features_count || 0,
            energy_efficiency_score: property.analytics?.variable_values?.energy_efficiency_score || 50,
            view_quality_score: property.analytics?.variable_values?.view_quality_score || 5,
            privacy_rating: property.analytics?.variable_values?.privacy_rating || 5,
            outdoor_space_sqft: property.square_feet?.lot || 0,
            finished_basement_sqft: property.analytics?.variable_values?.finished_basement_sqft || 0,

            // Investment
            cash_flow_monthly: property.analytics?.variable_values?.cash_flow_monthly || 0,
            roi_estimate_annual: property.analytics?.variable_values?.roi_estimate_annual || 5,
            equity_potential: property.analytics?.variable_values?.equity_potential || 0,
            value_add_opportunities_score: property.analytics?.variable_values?.value_add_opportunities_score || 30,
            development_potential_score: property.analytics?.variable_values?.development_potential_score || 20,
            rental_demand_score: property.analytics?.variable_values?.rental_demand_score || 50,
            tenant_quality_score: property.analytics?.variable_values?.tenant_quality_score || 60,
            vacancy_risk_score: property.analytics?.variable_values?.vacancy_risk_score || 30,
            market_cycle_position: property.analytics?.variable_values?.market_cycle_position || 5,
            comparable_performance_score: property.analytics?.variable_values?.comparable_performance_score || 50,

            // Competitive
            unique_features_count: property.analytics?.variable_values?.unique_features_count || 3,
            condition_vs_comps_score: property.analytics?.variable_values?.condition_vs_comps_score || 50,
            pricing_vs_comps_pct: property.analytics?.price_vs_market || 0,
            location_vs_comps_score: property.analytics?.variable_values?.location_vs_comps_score || 50,
            features_vs_comps_score: property.analytics?.variable_values?.features_vs_comps_score || 50,
            presentation_quality_score: property.media?.photos?.length > 10 ? 80 : 40,
            marketing_reach_score: property.analytics?.variable_values?.marketing_reach_score || 50,
            showing_availability_score: property.analytics?.variable_values?.showing_availability_score || 70
        };

        return mapping[variableName];
    }

    /**
     * Compare two properties
     */
    compareProperties(property1, property2, weightProfile = 'balanced') {
        const score1 = this.calculateScore(property1, weightProfile);
        const score2 = this.calculateScore(property2, weightProfile);

        return {
            property1_score: score1.overall,
            property2_score: score2.overall,
            difference: score1.overall - score2.overall,
            winner: score1.overall > score2.overall ? 'property1' : 'property2',
            category_comparison: this.compareCategoryScores(score1.by_category, score2.by_category)
        };
    }

    compareCategoryScores(cat1, cat2) {
        const comparison = {};

        for (const category in cat1) {
            comparison[category] = {
                property1: cat1[category].score,
                property2: cat2[category].score,
                difference: cat1[category].score - cat2[category].score
            };
        }

        return comparison;
    }

    /**
     * Get variable system for UI display
     */
    getVariableSystem() {
        return this.VARIABLE_SYSTEM;
    }

    /**
     * Get weight profiles
     */
    getWeightProfiles() {
        return this.WEIGHT_PROFILES;
    }
}

// Create singleton instance
const scoringEngine = new ScoringEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringEngine;
}
