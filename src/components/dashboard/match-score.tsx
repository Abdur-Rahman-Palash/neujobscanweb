'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Target,
  Eye,
  Download
} from 'lucide-react';
import { MatchResult } from '@/types';
import { formatScore, getScoreColor, getScoreVariant } from '@/lib/utils';

interface MatchScoreProps {
  matchResult: MatchResult;
  onViewDetails?: () => void;
  onDownloadReport?: () => void;
}

export function MatchScore({ matchResult, onViewDetails, onDownloadReport }: MatchScoreProps) {
  const scoreCategories = [
    { name: 'Overall', score: matchResult.overallScore, icon: Target },
    { name: 'ATS Score', score: matchResult.atsScore, icon: CheckCircle },
    { name: 'Keywords', score: matchResult.keywordScore, icon: TrendingUp },
    { name: 'Experience', score: matchResult.experienceScore, icon: TrendingUp },
    { name: 'Education', score: matchResult.educationScore, icon: CheckCircle },
    { name: 'Skills', score: matchResult.skillScore, icon: Target },
  ];

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const scoreLevel = getScoreLevel(matchResult.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Match Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={scoreLevel.bg}>
                <span className={scoreLevel.color}>{scoreLevel.label}</span>
              </Badge>
              <span className={`text-2xl font-bold ${getScoreColor(matchResult.overallScore)}`}>
                {formatScore(matchResult.overallScore)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {scoreCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-center p-4 border rounded-lg">
                  <category.icon className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(category.score)}`} />
                  <div className="text-sm text-gray-600 mb-1">{category.name}</div>
                  <div className={`text-lg font-semibold ${getScoreColor(category.score)}`}>
                    {formatScore(category.score)}
                  </div>
                  <Progress 
                    value={category.score} 
                    className="mt-2 h-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Match Percentage */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Match Percentage</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              {matchResult.matchPercentage}%
            </motion.div>
            <div className="text-sm text-gray-600 mt-2">
              {matchResult.matchPercentage >= 80 
                ? 'Excellent match! Apply with confidence.'
                : matchResult.matchPercentage >= 60
                ? 'Good match. Consider optimizing your resume.'
                : 'Consider improving your resume before applying.'
              }
            </div>
          </div>

          {/* Strengths and Gaps */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {matchResult.strengths.slice(0, 3).map((strength, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Areas to Improve
              </h4>
              <ul className="space-y-2">
                {matchResult.gaps.slice(0, 3).map((gap, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{gap}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          {matchResult.missingKeywords.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-700 mb-3">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingKeywords.slice(0, 8).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                    {keyword}
                  </Badge>
                ))}
                {matchResult.missingKeywords.length > 8 && (
                  <Badge variant="outline">
                    +{matchResult.missingKeywords.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onViewDetails}
              className="flex-1"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Detailed Analysis
            </Button>
            <Button 
              onClick={onDownloadReport}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
