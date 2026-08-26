import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizzesApi } from '../../api/quizzes';
import { Clock, CheckCircle, XCircle, Award, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesApi.getById(id!).then(r => r.data),
    onSuccess: (data: any) => {
      if (data.duration_minutes) {
        setTimeLeft(data.duration_minutes * 60);
      }
    },
  } as any);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => (t ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  const submitMutation = useMutation({
    mutationFn: () => quizzesApi.submitAttempt(id!, answers),
    onSuccess: (res) => {
      setResult(res.data);
      setSubmitted(true);
    },
    onError: () => toast.error('حدث خطأ في إرسال الإجابات'),
  });

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) {
      toast.error('يرجى الإجابة على سؤال واحد على الأقل');
      return;
    }
    submitMutation.mutate();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto space-y-4">
        <div className="h-10 bg-card rounded-xl" />
        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-xl" />)}
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center py-20 text-muted"><p>لم يتم العثور على الاختبار</p></div>;
  }

  // Results Screen
  if (submitted && result) {
    const passed = result.passed;
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-green-400/20' : 'bg-red-400/20'}`}>
          {passed
            ? <CheckCircle className="w-12 h-12 text-green-400" />
            : <XCircle className="w-12 h-12 text-red-400" />
          }
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {passed ? 'أحسنت! اجتزت الاختبار' : 'لم تجتز الاختبار'}
          </h2>
          <p className="text-muted">
            {passed ? 'عمل رائع، واصل التقدم!' : 'لا تستسلم، راجع المادة وحاول مجدداً'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted">نتيجتك</span>
            <span className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {Math.round(result.score)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">الإجابات الصحيحة</span>
            <span className="text-white font-bold">{result.correctCount} / {result.totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">درجة النجاح</span>
            <span className="text-white font-bold">{quiz.passing_score}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${passed ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-border text-muted hover:text-white py-3 rounded-xl font-bold transition-colors"
          >
            رجوع
          </button>
          <button
            onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); }}
            className="flex-1 bg-primary hover:bg-amber-500 text-white py-3 rounded-xl font-bold transition-colors"
          >
            إعادة الاختبار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          {quiz.description && <p className="text-muted text-sm mt-1">{quiz.description}</p>}
          <p className="text-xs text-muted mt-2">
            {quiz.questions?.length || 0} سؤال · درجة النجاح: {quiz.passing_score}%
          </p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl ${
            timeLeft < 60 ? 'bg-red-400/20 text-red-400' : 'bg-primary/20 text-primary'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions?.map((question: any, qIdx: number) => (
          <div key={question.id} className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-bold text-white mb-4">
              <span className="text-primary ml-2">{qIdx + 1}.</span>
              {question.question_text}
            </h3>
            <div className="space-y-2">
              {question.answers?.map((answer: any) => (
                <label
                  key={answer.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    answers[question.id] === answer.id
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-border text-muted hover:border-primary/50 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q_${question.id}`}
                    checked={answers[question.id] === answer.id}
                    onChange={() => setAnswers(prev => ({ ...prev, [question.id]: answer.id }))}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    answers[question.id] === answer.id ? 'border-primary bg-primary' : 'border-border'
                  }`} />
                  {answer.answer_text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-between items-center">
        <span className="text-muted text-sm">
          {Object.keys(answers).length} / {quiz.questions?.length || 0} تمت الإجابة
        </span>
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="bg-primary hover:bg-amber-500 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {submitMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Award className="w-5 h-5" />
          )}
          تسليم الإجابات
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
