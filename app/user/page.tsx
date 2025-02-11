/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleUserProps } from '@/model/user';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import useSWR from 'swr';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import LoadingGrid from '@/components/LoadingGrid';
import { toast } from '@/hooks/use-toast';

export default function User() {
  const { data, isLoading } = useSWR<SimpleUserProps>('/api/me');
  const { control, register, handleSubmit, reset } = useForm<SimpleUserProps>();
  const [loading, setLoading] = useState<boolean>(isLoading);

  async function updateUser(updateData: SimpleUserProps) {
    return fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    }).then((res) => res.json());
  }

  function onSubmit(formData: SimpleUserProps) {
    setLoading(true);
    updateUser(formData)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        toast({
          title: '사용자 정보가 업데이트 되었습니다',
          duration: 1500,
        });
        setLoading(false);
      });
  }

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        gender: data.gender,
        birthyear: data.birthyear,
        phone_number: data.phone_number,
        address: data.address,
      });
      setLoading(false);
    }
  }, [data, reset]);

  return (
    <div>
      <LoadingGrid loading={loading} />
      {!isLoading && (
        <form className="px-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input type="text" {...register('name')} />
              <p>실명으로 입력해주세요.</p>
            </div>
            <div>
              <Label>성별</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || data?.gender}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="성별을 선택해주세요." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>출생년도</Label>
              <Input
                type="text"
                {...register('birthyear')}
                placeholder="1988 네 자리 숫자만 입력해주세요."
              />
            </div>
            <div>
              <Label>핸드폰 번호</Label>
              <Input
                type="text"
                {...register('phone_number')}
                placeholder="숫자만 입력해주세요."
              />
            </div>
            <div>
              <Label>거주지</Label>
              <Input
                type="text"
                {...register('address')}
                placeholder="마포구 상암동"
              />
            </div>
            <div>
              <Button type="submit" className="w-full">
                전송
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
