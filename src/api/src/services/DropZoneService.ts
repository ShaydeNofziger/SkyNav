/**
 * DropZone service for managing dropzones in Cosmos DB
 */

import { CosmosClient, Container, SqlQuerySpec } from '@azure/cosmos';
import { DropZone } from '../models/DropZone';
import { DropZoneSummaryDTO, DropZoneDetailDTO, toDropZoneSummaryDTO, toDropZoneDetailDTO } from '../dtos/DropZoneDTO';

/**
 * Query options for listing dropzones
 */
export interface DropZoneQueryOptions {
  region?: string; // Filter by state (US) or region
  country?: string; // Filter by country
  isActive?: boolean; // Filter by active status
  page?: number; // Page number (1-based)
  pageSize?: number; // Results per page
}

/**
 * DropZone service for Cosmos DB operations
 */
export class DropZoneService {
  private container: Container;

  constructor(cosmosClient: CosmosClient, databaseName: string) {
    const database = cosmosClient.database(databaseName);
    this.container = database.container('dropzones');
  }

  /**
   * Get dropzone by ID
   * 
   * @param dropzoneId - Dropzone ID
   * @returns DropZone object or null if not found
   */
  async getDropZoneById(dropzoneId: string): Promise<DropZone | null> {
    try {
      const { resource } = await this.container.item(dropzoneId, dropzoneId).read<DropZone>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get dropzone detail DTO by ID
   * 
   * @param dropzoneId - Dropzone ID
   * @returns DropZone detail DTO or null if not found
   */
  async getDropZoneDetail(dropzoneId: string): Promise<DropZoneDetailDTO | null> {
    const dropzone = await this.getDropZoneById(dropzoneId);
    if (!dropzone) {
      return null;
    }
    return toDropZoneDetailDTO(dropzone);
  }

  /**
   * List dropzones with optional filtering
   * 
   * @param options - Query options for filtering and pagination
   * @returns Array of dropzone summary DTOs and pagination info
   */
  async listDropZones(options: DropZoneQueryOptions = {}): Promise<{
    dropzones: DropZoneSummaryDTO[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 30;
    const offset = (page - 1) * pageSize;

    // Build query
    let queryText = 'SELECT * FROM c WHERE 1=1';
    const parameters: any[] = [];

    // Filter by active status (default to true)
    const isActive = options.isActive !== undefined ? options.isActive : true;
    queryText += ' AND c.isActive = @isActive';
    parameters.push({ name: '@isActive', value: isActive });

    // Filter by country
    if (options.country) {
      queryText += ' AND c.address.country = @country';
      parameters.push({ name: '@country', value: options.country });
    }

    // Filter by region (state for US)
    if (options.region) {
      queryText += ' AND c.address.state = @region';
      parameters.push({ name: '@region', value: options.region });
    }

    // Add ordering
    queryText += ' ORDER BY c.name ASC';

    // Build query spec
    const querySpec: SqlQuerySpec = {
      query: queryText,
      parameters
    };

    // Execute query
    const { resources: dropzones } = await this.container.items
      .query<DropZone>(querySpec)
      .fetchAll();

    // Get total count
    const totalCount = dropzones.length;

    // Apply pagination manually (Cosmos DB serverless doesn't support OFFSET/LIMIT efficiently)
    // TODO: For production with large datasets, implement continuation token-based pagination
    // to reduce RU consumption and improve performance
    const paginatedDropzones = dropzones.slice(offset, offset + pageSize);

    // Convert to DTOs
    const dropzoneDTOs = paginatedDropzones.map(dz => toDropZoneSummaryDTO(dz));

    return {
      dropzones: dropzoneDTOs,
      totalCount,
      page,
      pageSize,
      hasMore: offset + pageSize < totalCount
    };
  }

  /**
   * Create or update dropzone (upsert)
   * 
   * @param dropzone - DropZone object
   * @returns Created/updated dropzone
   */
  async upsertDropZone(dropzone: DropZone): Promise<DropZone> {
    const { resource } = await this.container.items.upsert<DropZone>(dropzone);
    if (!resource) {
      throw new Error('Failed to upsert dropzone');
    }
    return resource;
  }

  /**
   * Delete dropzone by ID
   * 
   * @param dropzoneId - Dropzone ID
   */
  async deleteDropZone(dropzoneId: string): Promise<void> {
    await this.container.item(dropzoneId, dropzoneId).delete();
  }
}

/**
 * Create DropZoneService instance from environment variables
 */
export const createDropZoneService = (): DropZoneService => {
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_DB_KEY;
  const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'SkyNavDB';

  if (!endpoint || !key) {
    throw new Error('Cosmos DB configuration missing: COSMOS_DB_ENDPOINT and COSMOS_DB_KEY required');
  }

  const cosmosClient = new CosmosClient({ endpoint, key });
  return new DropZoneService(cosmosClient, databaseName);
};
