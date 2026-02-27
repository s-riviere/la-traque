export class CircularMap extends Map {
    constructor(entries) {
        super(entries);
        this.order = Array.from(this.keys());
    }

    set(key, value) {
        if (!super.has(key)) {
            this.order.push(key);
        }
        return super.set(key, value);
    }

    delete(key) {
        if (super.delete(key)) {
            this.order = this.order.filter(k => k !== key);
            return true;
        }
        return false;
    }

    clear() {
        this.order = [];
        super.clear();
    }

    reorder(newOrder) {
        const isValid = newOrder.length === this.size && new Set([...this.order, ...newOrder]).size === this.size;
        if (!isValid) return false;
        this.order = newOrder;
        return true;
    }
}
