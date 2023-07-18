-- CreateTable
CREATE TABLE "Run" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "distance" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "url" TEXT
);

-- CreateTable
CREATE TABLE "Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekIndex" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "distanceGoal" INTEGER NOT NULL,
    "timeGoal" INTEGER NOT NULL,
    CONSTRAINT "Week_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);
