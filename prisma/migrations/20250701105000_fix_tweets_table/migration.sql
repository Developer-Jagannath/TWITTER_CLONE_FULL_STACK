-- Fix tweets table column names to match Prisma schema
-- Rename authorId to userId
ALTER TABLE "tweets" RENAME COLUMN "authorId" TO "userId";

-- Rename likes to likesCount
ALTER TABLE "tweets" RENAME COLUMN "likes" TO "likesCount";

-- Rename retweets to retweetsCount
ALTER TABLE "tweets" RENAME COLUMN "retweets" TO "retweetsCount";

-- Rename replies to repliesCount
ALTER TABLE "tweets" RENAME COLUMN "replies" TO "repliesCount";

-- Update the foreign key constraint name
ALTER TABLE "tweets" DROP CONSTRAINT "tweets_authorId_fkey";
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; 