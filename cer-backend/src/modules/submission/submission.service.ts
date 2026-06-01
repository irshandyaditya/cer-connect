import prisma from "../../config/prisma";

export const submitAnswer = async (userId: string, mapId: string, answers: any[]) => {
    const submission = await prisma.submission.create({
        data: {
        userId,
        mapId,
        },
    });

    await prisma.answerConnection.createMany({
        data: answers.map(a => ({
        ...a,
        submissionId: submission.id,
        })),
    });

    return submission;
};

export const calculateScore = async (submissionId: string, mapId: string) => {
    const teacherConnections = await prisma.connection.findMany({
        where: { mapId },
    });

    const studentAnswers = await prisma.answerConnection.findMany({
        where: { submissionId },
    });

    const correctAnswers: { fromId: string; toId: string }[] = [];

    for (const ans of studentAnswers) {
        const match = teacherConnections.find(
            tc => tc.fromId === ans.fromId && tc.toId === ans.toId
        );
        if (match) correctAnswers.push({ fromId: ans.fromId, toId: ans.toId });
    }

    const score =
        teacherConnections.length === 0
        ? 0
        : (correctAnswers.length / teacherConnections.length) * 100;

    await prisma.submission.update({
        where: { id: submissionId },
        data: { score },
    });

    return { score, correctAnswers };
};