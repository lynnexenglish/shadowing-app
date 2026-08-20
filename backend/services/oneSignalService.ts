const ONESIGNAL_API_URL = "https://api.onesignal.com/notifications";

export const oneSignalService = {
  /**
   * Push teacher when a student submits a lesson recording.
   * Targets the teacher by External ID (= users.id). No-op if keys are missing.
   */
  async notifyTeacherNewSubmission(
    teacherId: string,
    studentName: string,
    lessonTitle: string,
    studentId: string,
    lessonId: string
  ) {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      console.log(
        "[OneSignal] Skipping push (ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY not set)"
      );
      return null;
    }

    if (!teacherId) {
      console.log("[OneSignal] Skipping push (no teacher id)");
      return null;
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const reviewUrl = `${appUrl}/en/teacher/student/${studentId}/lesson/${lessonId}`;

    const body = {
      app_id: appId,
      target_channel: "push",
      include_aliases: {
        external_id: [teacherId],
      },
      headings: {
        en: "New Lesson Submission",
      },
      contents: {
        en: `${studentName} submitted "${lessonTitle}"`,
      },
      url: reviewUrl,
    };

    try {
      const response = await fetch(ONESIGNAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;

      if (!response.ok) {
        console.error("[OneSignal] API error:", {
          status: response.status,
          data,
          teacherId,
        });
        return null;
      }

      console.log("[OneSignal] Push sent:", {
        teacherId,
        id: data?.id,
        recipients: data?.recipients,
      });
      return data;
    } catch (error) {
      console.error("[OneSignal] Failed to send:", {
        teacherId,
        error: error instanceof Error ? error.message : error,
      });
      return null;
    }
  },
};
