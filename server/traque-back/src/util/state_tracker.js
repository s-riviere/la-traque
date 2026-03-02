export class StateTracker {
    constructor(mapper) {
        this._mapper = mapper;
        this._hash = null;
    }

    getSyncDto() {
        const dto = this._mapper.map();
        const currentHash = this._mapper.hash(dto);
        const hasChanged = currentHash !== this._hash;
        this._hash = currentHash;
        return { dto, hasChanged };
    }
}
