"use server";

import { getBackendToken } from "@/lib/auth-helper";

interface QuizQuestion {
    id: string;
    text: string;
    imageUrl: string;
    relatedStyle: string;
}

interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/**
 * Fetches all quiz questions from the backend API
 * @returns ActionResponse with questions array or error message
 */
export async function fetchQuizQuestionsAction(): Promise<
    ActionResponse<QuizQuestion[]>
> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quiz-questions`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (res.ok) {
            const responseJson = await res.json();
            let questions: QuizQuestion[] = [];

            if (responseJson.data && Array.isArray(responseJson.data)) {
                questions = responseJson.data;
            } else if (Array.isArray(responseJson)) {
                questions = responseJson;
            }

            return {
                success: true,
                data: questions,
            };
        } else {
            return {
                success: false,
                message: "Gagal memuat quiz questions",
                data: [],
            };
        }
    } catch (error) {
        console.error("Error connection:", error);
        return {
            success: true, // Return success with empty array to not break UI
            data: [],
        };
    }
}

/**
 * Saves quiz questions to the backend API (updates all questions)
 * @param questions - Array of quiz questions to update
 * @returns ActionResponse with success status
 */
export async function saveQuizQuestionsAction(
    questions: QuizQuestion[]
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis. Silahkan login ulang.",
            };
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        // Update all questions
        const currentQuestions = Array.isArray(questions) ? questions : [];

        const updatePromises = currentQuestions.map(async (q) => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/quiz-questions/${q.id}`,
                    {
                        method: "PUT",
                        headers: headers,
                        body: JSON.stringify({
                            id: q.id,
                            text: q.text,
                            imageUrl: q.imageUrl,
                            relatedStyle: q.relatedStyle,
                        }),
                    }
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(
                        errData.message || `Failed to update ${q.id} (${res.status})`
                    );
                }
                return res;
            } catch (err: any) {
                console.error(`Failed to update question ${q.id}:`, err);
                throw err;
            }
        });

        await Promise.all(updatePromises);

        return {
            success: true,
            message: "Data berhasil disimpan ke server!",
        };
    } catch (error: any) {
        console.error("Save error:", error);
        return {
            success: false,
            message: error.message || "Gagal menyimpan",
        };
    }
}

/**
 * Deletes a quiz question by ID
 * @param questionId - Question ID to delete
 * @returns ActionResponse with success status
 */
export async function deleteQuizQuestionAction(
    questionId: string
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis, silakan login ulang",
            };
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quiz-questions/${questionId}`,
            {
                method: "DELETE",
                headers: headers,
            }
        );

        return {
            success: true,
            message: "Pertanyaan berhasil dihapus.",
        };
    } catch (error) {
        console.error("Gagal menghapus:", error);
        return {
            success: false,
            message: "Gagal menghapus data di server.",
        };
    }
}

/**
 * Creates a new quiz question
 * @param question - New question data
 * @returns ActionResponse with success status
 */
export async function createQuizQuestionAction(
    question: QuizQuestion
): Promise<ActionResponse> {
    try {
        const token = await getBackendToken();

        if (!token) {
            return {
                success: false,
                message: "Sesi habis. Silahkan login ulang.",
            };
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz-questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(question),
        });

        return {
            success: true,
            message: "Pertanyaan berhasil dibuat",
        };
    } catch (error) {
        console.error("Gagal membuat pertanyaan:", error);
        return {
            success: false,
            message: "Gagal koneksi ke server.",
        };
    }
}
