# SkyNav Seed Data

This directory contains seed data for initializing the SkyNav database.

## Files

- `seed-dropzones.json` - Initial dropzone data with 8 US dropzones

## Dropzone Seed Data

The seed dropzones include:

1. **Skydive Perris** (CA) - Year-round, major West Coast DZ
2. **Skydive Chicago** (IL) - Seasonal, premier Midwest DZ
3. **Skydive Spaceland Houston** (TX) - Year-round, coaching-focused
4. **Skydive Arizona** (AZ) - Year-round, world's largest DZ
5. **Skydive Sebastian** (FL) - Year-round, East Coast ocean views
6. **Skydive DeLand** (FL) - Year-round, historic event host
7. **Skydive New England** (ME) - Seasonal, Northeast location
8. **Skydive Carolina** (SC) - Year-round, freefly/swooping focus

Each dropzone includes:
- **Location**: GPS coordinates (GeoJSON Point format)
- **Aircraft types**: Twin Otters, Caravans, Skyvans, King Airs
- **Seasonality notes**: Operating season information
- **Regional information**: State-based location for filtering

## Usage

To seed the database with this data, run:

```bash
npm run seed-dropzones
```

Make sure your environment variables are properly configured in `local.settings.json`.

## Data Format

Each dropzone follows the `DropZone` domain model schema defined in `/src/api/src/models/DropZone.ts`.

Required fields:
- `id` - Unique identifier (format: `dz-{guid}`)
- `name` - Official dropzone name
- `location` - GeoJSON Point with [longitude, latitude]
- `address` - Physical address with city, state, zip, country
- `facilities` - Aircraft, altitude, amenities
- `isActive` - Operational status
- `createdAt/updatedAt` - Timestamps
- `createdBy` - User ID who created the record

Optional fields:
- `displayName` - Marketing name
- `description` - Dropzone description
- `phone/email/website` - Contact information
- `seasonality` - Seasonal operation notes
- `operatingHours` - Detailed operating schedule

## Extending Seed Data

To add more dropzones:

1. Follow the existing JSON structure
2. Generate a unique GUID for the `id` field (format: `dz-{guid}`)
3. Use accurate GPS coordinates in [longitude, latitude] order
4. Include seasonality notes for regional context
5. Set `createdBy` to "system" for seed data
6. Validate the JSON syntax before committing
