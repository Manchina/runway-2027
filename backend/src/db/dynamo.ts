import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = process.env.DYNAMO_TABLE || 'runway_2027';

export interface DsaItem {
  pk: 'DSA';
  sk: string; // e.g. "PROBLEM#dsa-217"
  id: string;
  title: string;
  leetcodeNumber: number;
  pattern: string;
  leetcodeUrl: string;
  struggleTier: 1 | 2 | 3;
  dateLogged: string;
  scheduledReviewDate: string | null;
  reviewStatus: 'not_needed' | 'pending' | 'cleared';
  notes?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  weekNumber?: number;
}

export interface HldItem {
  pk: 'HLD';
  sk: string; // e.g. "WEEK#1"
  weekNumber: number;
  chapterTitle: string;
  bookVolume: 1 | 2;
  coreConcepts: string[];
  deliverable: string;
  excalidrawUrl?: string;
  summaryNotes?: string;
  status: 'not_started' | 'reading' | 'diagrammed' | 'mastered';
  checklist: {
    readingDone: boolean;
    estimationPracticed: boolean;
    diagramCompleted: boolean;
    bottlenecksAudited: boolean;
  };
}

export interface MetaItem {
  pk: 'META';
  sk: 'STREAK';
  streakCount: number;
  lastCompletedDate: string | null;
  updatedAt: string;
}

// Data Access Methods
export async function getAllDsaProblems(): Promise<DsaItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': 'DSA' },
    })
  );
  return (result.Items as DsaItem[]) || [];
}

export async function putDsaProblem(problem: Omit<DsaItem, 'pk' | 'sk'>): Promise<DsaItem> {
  const item: DsaItem = {
    ...problem,
    pk: 'DSA',
    sk: `PROBLEM#${problem.id}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function deleteDsaProblem(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: 'DSA',
        sk: `PROBLEM#${id}`,
      },
    })
  );
}

export async function getAllHldWeeks(): Promise<HldItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': 'HLD' },
    })
  );
  const items = (result.Items as HldItem[]) || [];
  return items.sort((a, b) => a.weekNumber - b.weekNumber);
}

export async function putHldWeek(week: Omit<HldItem, 'pk' | 'sk'>): Promise<HldItem> {
  const item: HldItem = {
    ...week,
    pk: 'HLD',
    sk: `WEEK#${week.weekNumber}`,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function getStreakMeta(): Promise<MetaItem> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: 'META',
        sk: 'STREAK',
      },
    })
  );

  if (!result.Item) {
    return {
      pk: 'META',
      sk: 'STREAK',
      streakCount: 0,
      lastCompletedDate: null,
      updatedAt: new Date().toISOString(),
    };
  }

  return result.Item as MetaItem;
}

export async function updateStreakMeta(
  streakCount: number,
  lastCompletedDate: string | null
): Promise<MetaItem> {
  const item: MetaItem = {
    pk: 'META',
    sk: 'STREAK',
    streakCount,
    lastCompletedDate,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}
