export type UserRole = "doctor" | "patient";

export class User {
    private id: string;
    private email: string;
    private name: string;
    private role: UserRole;
    private createdAt: Date;
    private updatedAt: Date;

    constructor(data: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: string | Date;
        updatedAt: string | Date;
    }) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.role = data.role;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = new Date(data.updatedAt);
    }

    get getId(): string {
        return this.id;
    }

    get getEmail(): string {
        return this.email;
    }

    get getName(): string {
        return this.name;
    }

    get getRole(): UserRole {
        return this.role;
    }

    get getCreatedAt(): Date {
        return this.createdAt;
    }

    get getUpdatedAt(): Date {
        return this.updatedAt;
    }

    set setId(newId: string) {
        this.id = newId;
    }

    set setEmail(newEmail: string) {
        this.email = newEmail;
    }

    set setName(newName: string) {
        this.name = newName;
    }

    set setRole(newRole: UserRole) {
        this.role = newRole;
    }

    set setUpdatedAt(newDate: string | Date) {
        this.updatedAt = new Date(newDate);
    }

    isDoctor(): boolean {
        return this.role === "doctor";
    }

    isPatient(): boolean {
        return this.role === "patient";
    }

    getDisplayName(): string {
        return `${this.name} (${this.role})`;
    }
}
