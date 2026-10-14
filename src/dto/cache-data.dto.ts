export abstract class CacheDataDto {
  ttl?: number;
  createdAt: Date;
  updatedAt: Date;

  protected constructor(ttl?: number) {
    if (ttl !== undefined) {
      this.ttl = ttl;
    }

    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
