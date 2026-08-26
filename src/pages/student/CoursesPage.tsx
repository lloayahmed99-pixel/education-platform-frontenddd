import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Clock, Star, Users, Filter } from 'lucide-react';
import coursesApi from '../../api/courses';
import CourseCard from '../../components/student/CourseCard';

const CoursesPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', search, page],
    queryFn: () => coursesApi.getAll({ search, page, limit: 12, published: true }).then(r => r.data),
    keepPreviousData: true,
  } as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          الكورسات
        </h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث عن كورس..."
            className="w-full bg-card border border-border rounded-xl px-4 py-2 pr-10 text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-card rounded-2xl border border-border" />
          ))}
        </div>
      ) : data?.courses && data.courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-bold transition-colors ${
                    p === page ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:border-primary hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-muted">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد كورسات</p>
          {search && <p className="text-sm mt-2">جرب البحث بكلمة مختلفة</p>}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
